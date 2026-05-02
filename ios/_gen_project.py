#!/usr/bin/env python3
"""Generate a valid Xcode project.pbxproj for UnmatchedCounter targeting iOS 12.0.

This script is intentionally self-contained so the iOS folder is buildable
without depending on any third-party tooling (xcodegen, etc.).

Run from the repo root: `python3 ios/_gen_project.py`.
"""
import os
import sys
import hashlib

ROOT = os.path.dirname(os.path.abspath(__file__))
APP_DIR_NAME = "UnmatchedCounter"
APP_DIR = os.path.join(ROOT, APP_DIR_NAME)

PROJECT_NAME = "UnmatchedCounter"
BUNDLE_ID = "com.unmatchedcounter"
DEPLOYMENT_TARGET = "12.0"
SWIFT_VERSION = "5.0"
ORG_NAME = "unmatchedcounter"

# ---- Helpers ----------------------------------------------------------------

def stable_id(*parts: str) -> str:
    """Build a stable 24-char hex id from a tuple of strings.

    Xcode object IDs are 24-hex strings. We hash inputs so the same project
    layout always regenerates the same project file, which keeps diffs sane.
    """
    h = hashlib.sha1("|".join(parts).encode("utf-8")).hexdigest().upper()
    return h[:24]

def relpath(p: str) -> str:
    return os.path.relpath(p, ROOT)

def collect_files() -> dict:
    """Walk the app folder and bucket entries by purpose."""
    swift_files = []
    plist_path = None
    asset_path = None
    launch_path = None

    for root, dirs, files in os.walk(APP_DIR):
        # skip asset catalog innards (we add it as a single folder reference).
        if root.endswith(".xcassets") or ".xcassets" in root:
            continue
        for f in files:
            full = os.path.join(root, f)
            if f.endswith(".swift"):
                swift_files.append(full)
            elif f == "Info.plist":
                plist_path = full
            elif f.endswith(".storyboard"):
                launch_path = full
        for d in dirs:
            if d.endswith(".xcassets"):
                asset_path = os.path.join(root, d)
                break

    swift_files.sort()
    return {
        "swift": swift_files,
        "plist": plist_path,
        "assets": asset_path,
        "storyboard": launch_path,
    }

# ---- Hierarchy --------------------------------------------------------------

class Group:
    def __init__(self, name: str, path: str = None, children=None, source_tree="<group>"):
        self.name = name
        self.path = path
        self.children = children or []
        self.source_tree = source_tree
        self.id = stable_id("group", name, path or "")

class FileRef:
    def __init__(self, name: str, full_path: str, file_type: str, source_tree: str = "<group>"):
        self.name = name
        self.full_path = full_path
        self.path = name  # relative to its group
        self.file_type = file_type
        self.source_tree = source_tree
        self.id = stable_id("fileref", relpath(full_path))

# ---- Build phase entries ----------------------------------------------------

class BuildFile:
    def __init__(self, fileref: FileRef, phase: str):
        self.fileref = fileref
        self.phase = phase
        self.id = stable_id("buildfile", phase, fileref.id)

# ---- pbxproj writer ---------------------------------------------------------

def emit():
    f = collect_files()
    plist_rel = relpath(f["plist"]) if f["plist"] else None

    # Top-level container group "UnmatchedCounter" maps to the app folder.
    root_app_group = Group(name=APP_DIR_NAME, path=APP_DIR_NAME)

    # Build hierarchical groups that mirror the on-disk layout.
    src_groups = {}    # rel-path -> Group
    def get_group_for(folder_abs):
        """Return (and lazily create) a Group node for an on-disk folder."""
        rel = os.path.relpath(folder_abs, APP_DIR)
        if rel == ".":
            return root_app_group
        if rel in src_groups:
            return src_groups[rel]
        parent_abs = os.path.dirname(folder_abs)
        parent_group = get_group_for(parent_abs)
        name = os.path.basename(folder_abs)
        g = Group(name=name, path=name)
        src_groups[rel] = g
        parent_group.children.append(g)
        return g

    swift_refs = []
    for sf in f["swift"]:
        ref = FileRef(name=os.path.basename(sf), full_path=sf, file_type="sourcecode.swift")
        swift_refs.append(ref)
        get_group_for(os.path.dirname(sf)).children.append(ref)

    # Resources: assets catalog, storyboard, Info.plist.
    res_files = []
    if f["assets"]:
        ref = FileRef(name=os.path.basename(f["assets"]),
                      full_path=f["assets"],
                      file_type="folder.assetcatalog")
        res_files.append(ref)
        get_group_for(os.path.dirname(f["assets"])).children.append(ref)
    if f["storyboard"]:
        ref = FileRef(name=os.path.basename(f["storyboard"]),
                      full_path=f["storyboard"],
                      file_type="file.storyboard")
        res_files.append(ref)
        get_group_for(os.path.dirname(f["storyboard"])).children.append(ref)

    info_ref = None
    if f["plist"]:
        info_ref = FileRef(name=os.path.basename(f["plist"]),
                           full_path=f["plist"],
                           file_type="text.plist.xml")
        get_group_for(os.path.dirname(f["plist"])).children.append(info_ref)

    # Products group (contains the .app file reference).
    product_ref = FileRef(name=f"{PROJECT_NAME}.app",
                          full_path=f"<built>/{PROJECT_NAME}.app",
                          file_type="wrapper.application",
                          source_tree="BUILT_PRODUCTS_DIR")
    products_group = Group(name="Products", children=[product_ref])

    main_group = Group(name="MainGroup", children=[root_app_group, products_group])

    # Build files.
    sources_bf = [BuildFile(r, "Sources") for r in swift_refs]
    resources_bf = [BuildFile(r, "Resources") for r in res_files]

    # IDs.
    project_id = stable_id("project", PROJECT_NAME)
    target_id = stable_id("target", PROJECT_NAME)
    sources_phase_id = stable_id("phase", "sources", PROJECT_NAME)
    frameworks_phase_id = stable_id("phase", "frameworks", PROJECT_NAME)
    resources_phase_id = stable_id("phase", "resources", PROJECT_NAME)
    project_cfg_list_id = stable_id("cfglist", "project", PROJECT_NAME)
    target_cfg_list_id = stable_id("cfglist", "target", PROJECT_NAME)
    project_debug_id = stable_id("cfg", "project", "Debug")
    project_release_id = stable_id("cfg", "project", "Release")
    target_debug_id = stable_id("cfg", "target", "Debug")
    target_release_id = stable_id("cfg", "target", "Release")

    out = []
    w = out.append
    w("// !$*UTF8*$!")
    w("{")
    w("\tarchiveVersion = 1;")
    w("\tclasses = {")
    w("\t};")
    w("\tobjectVersion = 54;")
    w("\tobjects = {")

    # ---- PBXBuildFile ----
    w("\n/* Begin PBXBuildFile section */")
    for bf in sources_bf + resources_bf:
        w(f"\t\t{bf.id} /* {bf.fileref.name} in {bf.phase} */ = {{isa = PBXBuildFile; fileRef = {bf.fileref.id} /* {bf.fileref.name} */; }};")
    w("/* End PBXBuildFile section */")

    # ---- PBXFileReference ----
    w("\n/* Begin PBXFileReference section */")
    all_refs = swift_refs + res_files + ([info_ref] if info_ref else []) + [product_ref]
    for r in all_refs:
        attrs = [f"isa = PBXFileReference"]
        attrs.append(f"lastKnownFileType = {r.file_type}")
        attrs.append(f"path = \"{r.path}\"")
        attrs.append(f"sourceTree = \"{r.source_tree}\"")
        w(f"\t\t{r.id} /* {r.name} */ = {{{ '; '.join(attrs) }; }};")
    w("/* End PBXFileReference section */")

    # ---- PBXFrameworksBuildPhase ----
    w("\n/* Begin PBXFrameworksBuildPhase section */")
    w(f"\t\t{frameworks_phase_id} /* Frameworks */ = {{")
    w("\t\t\tisa = PBXFrameworksBuildPhase;")
    w("\t\t\tbuildActionMask = 2147483647;")
    w("\t\t\tfiles = (")
    w("\t\t\t);")
    w("\t\t\trunOnlyForDeploymentPostprocessing = 0;")
    w("\t\t};")
    w("/* End PBXFrameworksBuildPhase section */")

    # ---- PBXGroup ----
    def emit_group(g):
        w(f"\t\t{g.id} /* {g.name} */ = {{")
        w("\t\t\tisa = PBXGroup;")
        w("\t\t\tchildren = (")
        # Folders first, then files.
        children_sorted = sorted(g.children, key=lambda c: (0 if isinstance(c, Group) else 1, c.name.lower()))
        for c in children_sorted:
            w(f"\t\t\t\t{c.id} /* {c.name} */,")
        w("\t\t\t);")
        if g.path:
            w(f"\t\t\tpath = \"{g.path}\";")
        else:
            w(f"\t\t\tname = \"{g.name}\";")
        w(f"\t\t\tsourceTree = \"{g.source_tree}\";")
        w("\t\t};")

    w("\n/* Begin PBXGroup section */")
    # Walk the tree.
    def walk_groups(g):
        emit_group(g)
        for c in g.children:
            if isinstance(c, Group):
                walk_groups(c)
    walk_groups(main_group)
    w("/* End PBXGroup section */")

    # ---- PBXNativeTarget ----
    w("\n/* Begin PBXNativeTarget section */")
    w(f"\t\t{target_id} /* {PROJECT_NAME} */ = {{")
    w("\t\t\tisa = PBXNativeTarget;")
    w(f"\t\t\tbuildConfigurationList = {target_cfg_list_id};")
    w("\t\t\tbuildPhases = (")
    w(f"\t\t\t\t{sources_phase_id} /* Sources */,")
    w(f"\t\t\t\t{frameworks_phase_id} /* Frameworks */,")
    w(f"\t\t\t\t{resources_phase_id} /* Resources */,")
    w("\t\t\t);")
    w("\t\t\tbuildRules = (")
    w("\t\t\t);")
    w("\t\t\tdependencies = (")
    w("\t\t\t);")
    w(f"\t\t\tname = \"{PROJECT_NAME}\";")
    w(f"\t\t\tproductName = \"{PROJECT_NAME}\";")
    w(f"\t\t\tproductReference = {product_ref.id} /* {PROJECT_NAME}.app */;")
    w("\t\t\tproductType = \"com.apple.product-type.application\";")
    w("\t\t};")
    w("/* End PBXNativeTarget section */")

    # ---- PBXProject ----
    w("\n/* Begin PBXProject section */")
    w(f"\t\t{project_id} /* Project object */ = {{")
    w("\t\t\tisa = PBXProject;")
    w("\t\t\tattributes = {")
    w("\t\t\t\tBuildIndependentTargetsInParallel = YES;")
    w("\t\t\t\tLastSwiftUpdateCheck = 1500;")
    w("\t\t\t\tLastUpgradeCheck = 1500;")
    w(f"\t\t\t\tORGANIZATIONNAME = \"{ORG_NAME}\";")
    w("\t\t\t\tTargetAttributes = {")
    w(f"\t\t\t\t\t{target_id} = {{")
    w("\t\t\t\t\t\tCreatedOnToolsVersion = 12.5.1;")
    w("\t\t\t\t\t};")
    w("\t\t\t\t};")
    w("\t\t\t};")
    w(f"\t\t\tbuildConfigurationList = {project_cfg_list_id};")
    w("\t\t\tcompatibilityVersion = \"Xcode 12.0\";")
    w("\t\t\tdevelopmentRegion = en;")
    w("\t\t\thasScannedForEncodings = 0;")
    w("\t\t\tknownRegions = (")
    w("\t\t\t\ten,")
    w("\t\t\t\tBase,")
    w("\t\t\t);")
    w(f"\t\t\tmainGroup = {main_group.id};")
    w(f"\t\t\tproductRefGroup = {products_group.id};")
    w("\t\t\tprojectDirPath = \"\";")
    w("\t\t\tprojectRoot = \"\";")
    w("\t\t\ttargets = (")
    w(f"\t\t\t\t{target_id},")
    w("\t\t\t);")
    w("\t\t};")
    w("/* End PBXProject section */")

    # ---- PBXResourcesBuildPhase ----
    w("\n/* Begin PBXResourcesBuildPhase section */")
    w(f"\t\t{resources_phase_id} /* Resources */ = {{")
    w("\t\t\tisa = PBXResourcesBuildPhase;")
    w("\t\t\tbuildActionMask = 2147483647;")
    w("\t\t\tfiles = (")
    for bf in resources_bf:
        w(f"\t\t\t\t{bf.id} /* {bf.fileref.name} in Resources */,")
    w("\t\t\t);")
    w("\t\t\trunOnlyForDeploymentPostprocessing = 0;")
    w("\t\t};")
    w("/* End PBXResourcesBuildPhase section */")

    # ---- PBXSourcesBuildPhase ----
    w("\n/* Begin PBXSourcesBuildPhase section */")
    w(f"\t\t{sources_phase_id} /* Sources */ = {{")
    w("\t\t\tisa = PBXSourcesBuildPhase;")
    w("\t\t\tbuildActionMask = 2147483647;")
    w("\t\t\tfiles = (")
    for bf in sources_bf:
        w(f"\t\t\t\t{bf.id} /* {bf.fileref.name} in Sources */,")
    w("\t\t\t);")
    w("\t\t\trunOnlyForDeploymentPostprocessing = 0;")
    w("\t\t};")
    w("/* End PBXSourcesBuildPhase section */")

    # ---- XCBuildConfiguration (project) ----
    def project_settings(name):
        s = {
            "ALWAYS_SEARCH_USER_PATHS": "NO",
            "CLANG_ANALYZER_NONNULL": "YES",
            "CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION": "YES_AGGRESSIVE",
            "CLANG_CXX_LANGUAGE_STANDARD": "\"gnu++17\"",
            "CLANG_CXX_LIBRARY": "\"libc++\"",
            "CLANG_ENABLE_MODULES": "YES",
            "CLANG_ENABLE_OBJC_ARC": "YES",
            "CLANG_ENABLE_OBJC_WEAK": "YES",
            "CLANG_WARN_BLOCK_CAPTURE_AUTORELEASING": "YES",
            "CLANG_WARN_BOOL_CONVERSION": "YES",
            "CLANG_WARN_COMMA": "YES",
            "CLANG_WARN_CONSTANT_CONVERSION": "YES",
            "CLANG_WARN_DEPRECATED_OBJC_IMPLEMENTATIONS": "YES",
            "CLANG_WARN_DIRECT_OBJC_ISA_USAGE": "YES_ERROR",
            "CLANG_WARN_DOCUMENTATION_COMMENTS": "YES",
            "CLANG_WARN_EMPTY_BODY": "YES",
            "CLANG_WARN_ENUM_CONVERSION": "YES",
            "CLANG_WARN_INFINITE_RECURSION": "YES",
            "CLANG_WARN_INT_CONVERSION": "YES",
            "CLANG_WARN_NON_LITERAL_NULL_CONVERSION": "YES",
            "CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF": "YES",
            "CLANG_WARN_OBJC_LITERAL_CONVERSION": "YES",
            "CLANG_WARN_OBJC_ROOT_CLASS": "YES_ERROR",
            "CLANG_WARN_RANGE_LOOP_ANALYSIS": "YES",
            "CLANG_WARN_STRICT_PROTOTYPES": "YES",
            "CLANG_WARN_SUSPICIOUS_MOVE": "YES",
            "CLANG_WARN_UNGUARDED_AVAILABILITY": "YES_AGGRESSIVE",
            "CLANG_WARN_UNREACHABLE_CODE": "YES",
            "CLANG_WARN__DUPLICATE_METHOD_MATCH": "YES",
            "COPY_PHASE_STRIP": "NO",
            "ENABLE_NS_ASSERTIONS": ("YES" if name == "Debug" else "NO"),
            "ENABLE_STRICT_OBJC_MSGSEND": "YES",
            "GCC_C_LANGUAGE_STANDARD": "gnu11",
            "GCC_NO_COMMON_BLOCKS": "YES",
            "GCC_WARN_64_TO_32_BIT_CONVERSION": "YES",
            "GCC_WARN_ABOUT_RETURN_TYPE": "YES_ERROR",
            "GCC_WARN_UNDECLARED_SELECTOR": "YES",
            "GCC_WARN_UNINITIALIZED_AUTOS": "YES_AGGRESSIVE",
            "GCC_WARN_UNUSED_FUNCTION": "YES",
            "GCC_WARN_UNUSED_VARIABLE": "YES",
            "IPHONEOS_DEPLOYMENT_TARGET": DEPLOYMENT_TARGET,
            "MTL_FAST_MATH": "YES",
            "SDKROOT": "iphoneos",
            "SWIFT_VERSION": SWIFT_VERSION,
        }
        if name == "Debug":
            s["DEBUG_INFORMATION_FORMAT"] = "dwarf"
            s["GCC_DYNAMIC_NO_PIC"] = "NO"
            s["GCC_OPTIMIZATION_LEVEL"] = "0"
            s["GCC_PREPROCESSOR_DEFINITIONS"] = "(\n\t\t\t\t\t\"DEBUG=1\",\n\t\t\t\t\t\"$(inherited)\",\n\t\t\t\t)"
            s["MTL_ENABLE_DEBUG_INFO"] = "INCLUDE_SOURCE"
            s["ONLY_ACTIVE_ARCH"] = "YES"
            s["SWIFT_ACTIVE_COMPILATION_CONDITIONS"] = "DEBUG"
            s["SWIFT_OPTIMIZATION_LEVEL"] = "\"-Onone\""
        else:
            s["DEBUG_INFORMATION_FORMAT"] = "\"dwarf-with-dsym\""
            s["ENABLE_NS_ASSERTIONS"] = "NO"
            s["MTL_ENABLE_DEBUG_INFO"] = "NO"
            s["SWIFT_COMPILATION_MODE"] = "wholemodule"
            s["VALIDATE_PRODUCT"] = "YES"
        return s

    def target_settings(name):
        s = {
            "ASSETCATALOG_COMPILER_APPICON_NAME": "AppIcon",
            "CODE_SIGN_STYLE": "Automatic",
            "CURRENT_PROJECT_VERSION": "1",
            "GENERATE_INFOPLIST_FILE": "NO",
            "INFOPLIST_FILE": f"\"{plist_rel}\"" if plist_rel else "\"\"",
            "LD_RUNPATH_SEARCH_PATHS": "(\n\t\t\t\t\t\"$(inherited)\",\n\t\t\t\t\t\"@executable_path/Frameworks\",\n\t\t\t\t)",
            "MARKETING_VERSION": "3.4.4",
            "PRODUCT_BUNDLE_IDENTIFIER": BUNDLE_ID,
            "PRODUCT_NAME": "\"$(TARGET_NAME)\"",
            "SWIFT_EMIT_LOC_STRINGS": "YES",
            "TARGETED_DEVICE_FAMILY": "\"1,2\"",
        }
        return s

    def emit_cfg(cfg_id, name, settings):
        w(f"\t\t{cfg_id} /* {name} */ = {{")
        w("\t\t\tisa = XCBuildConfiguration;")
        w("\t\t\tbuildSettings = {")
        for k in sorted(settings.keys()):
            v = settings[k]
            w(f"\t\t\t\t{k} = {v};")
        w("\t\t\t};")
        w(f"\t\t\tname = {name};")
        w("\t\t};")

    w("\n/* Begin XCBuildConfiguration section */")
    emit_cfg(project_debug_id, "Debug", project_settings("Debug"))
    emit_cfg(project_release_id, "Release", project_settings("Release"))
    emit_cfg(target_debug_id, "Debug", target_settings("Debug"))
    emit_cfg(target_release_id, "Release", target_settings("Release"))
    w("/* End XCBuildConfiguration section */")

    # ---- XCConfigurationList ----
    def emit_cfg_list(list_id, label, debug_id, release_id):
        w(f"\t\t{list_id} /* Build configuration list for {label} */ = {{")
        w("\t\t\tisa = XCConfigurationList;")
        w("\t\t\tbuildConfigurations = (")
        w(f"\t\t\t\t{debug_id} /* Debug */,")
        w(f"\t\t\t\t{release_id} /* Release */,")
        w("\t\t\t);")
        w("\t\t\tdefaultConfigurationIsVisible = 0;")
        w("\t\t\tdefaultConfigurationName = Release;")
        w("\t\t};")

    w("\n/* Begin XCConfigurationList section */")
    emit_cfg_list(project_cfg_list_id, f"PBXProject \"{PROJECT_NAME}\"",
                  project_debug_id, project_release_id)
    emit_cfg_list(target_cfg_list_id, f"PBXNativeTarget \"{PROJECT_NAME}\"",
                  target_debug_id, target_release_id)
    w("/* End XCConfigurationList section */")

    w("\t};")
    w(f"\trootObject = {project_id} /* Project object */;")
    w("}")

    pbx_path = os.path.join(ROOT, f"{PROJECT_NAME}.xcodeproj", "project.pbxproj")
    os.makedirs(os.path.dirname(pbx_path), exist_ok=True)
    with open(pbx_path, "w") as out_f:
        out_f.write("\n".join(out) + "\n")

    # Workspace data so File > Open works straight from the .xcodeproj.
    ws_path = os.path.join(ROOT, f"{PROJECT_NAME}.xcodeproj", "project.xcworkspace", "contents.xcworkspacedata")
    os.makedirs(os.path.dirname(ws_path), exist_ok=True)
    with open(ws_path, "w") as out_f:
        out_f.write(
            "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
            "<Workspace version=\"1.0\">\n"
            "   <FileRef location=\"self:\"/>\n"
            "</Workspace>\n"
        )

    # Shared scheme so the target shows up in Xcode's scheme picker.
    scheme_dir = os.path.join(ROOT, f"{PROJECT_NAME}.xcodeproj", "xcshareddata", "xcschemes")
    os.makedirs(scheme_dir, exist_ok=True)
    scheme = f"""<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion="1500" version="1.7">
   <BuildAction parallelizeBuildables="YES" buildImplicitDependencies="YES">
      <BuildActionEntries>
         <BuildActionEntry buildForTesting="YES" buildForRunning="YES" buildForProfiling="YES" buildForArchiving="YES" buildForAnalyzing="YES">
            <BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="{target_id}" BuildableName="{PROJECT_NAME}.app" BlueprintName="{PROJECT_NAME}" ReferencedContainer="container:{PROJECT_NAME}.xcodeproj"/>
         </BuildActionEntry>
      </BuildActionEntries>
   </BuildAction>
   <TestAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.DebuggerFoundation.Launcher.LLDB" shouldUseLaunchSchemeArgsEnv="YES"/>
   <LaunchAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.DebuggerFoundation.Launcher.LLDB" launchStyle="0" useCustomWorkingDirectory="NO" ignoresPersistentStateOnLaunch="NO" debugDocumentVersioning="YES" debugServiceExtension="internal" allowLocationSimulation="YES">
      <BuildableProductRunnable runnableDebuggingMode="0">
         <BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="{target_id}" BuildableName="{PROJECT_NAME}.app" BlueprintName="{PROJECT_NAME}" ReferencedContainer="container:{PROJECT_NAME}.xcodeproj"/>
      </BuildableProductRunnable>
   </LaunchAction>
   <ProfileAction buildConfiguration="Release" shouldUseLaunchSchemeArgsEnv="YES" savedToolIdentifier="" useCustomWorkingDirectory="NO" debugDocumentVersioning="YES">
      <BuildableProductRunnable runnableDebuggingMode="0">
         <BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="{target_id}" BuildableName="{PROJECT_NAME}.app" BlueprintName="{PROJECT_NAME}" ReferencedContainer="container:{PROJECT_NAME}.xcodeproj"/>
      </BuildableProductRunnable>
   </ProfileAction>
   <AnalyzeAction buildConfiguration="Debug"/>
   <ArchiveAction buildConfiguration="Release" revealArchiveInOrganizer="YES"/>
</Scheme>
"""
    with open(os.path.join(scheme_dir, f"{PROJECT_NAME}.xcscheme"), "w") as out_f:
        out_f.write(scheme)

    # Pretty summary.
    print(f"Generated {pbx_path}")
    print(f"  Sources: {len(swift_refs)} swift files")
    print(f"  Resources: {len(res_files)} resource(s)")
    if info_ref:
        print(f"  Info.plist: {plist_rel}")

if __name__ == "__main__":
    emit()

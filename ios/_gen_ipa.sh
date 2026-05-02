#!/usr/bin/env bash
# Build an unsigned .ipa for UnmatchedCounter.
#
# Pipeline:
#   1. xcodebuild archive (Release, generic/iOS, unsigned)
#   2. wrap the resulting .app in Payload/<App>.app
#   3. zip into ios/build/UnmatchedCounter.ipa
#
# The IPA is unsigned, so iOS won't install it directly. To put it on a real
# device, re-sign it with a tool like Sideloadly or AltStore (free Apple ID is
# enough for a 7-day cert), or set DEVELOPMENT_TEAM in _gen_project.py and use
# the signed Xcode Archive flow instead.
#
# Run from the repo root:
#   bash ios/_gen_ipa.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

PROJECT="ios/UnmatchedCounter.xcodeproj"
SCHEME="UnmatchedCounter"
BUILD_DIR="ios/build"
ARCHIVE_PATH="$BUILD_DIR/UnmatchedCounter.xcarchive"
DERIVED_DATA="$BUILD_DIR/DerivedData"
IPA_PATH="$BUILD_DIR/UnmatchedCounter.ipa"

echo "==> Cleaning previous artefacts"
rm -rf "$ARCHIVE_PATH" "$IPA_PATH" "$BUILD_DIR/Payload"

echo "==> Archiving (Release, unsigned)"
xcodebuild \
    -project "$PROJECT" \
    -scheme "$SCHEME" \
    -configuration Release \
    -destination 'generic/platform=iOS' \
    -archivePath "$ARCHIVE_PATH" \
    -derivedDataPath "$DERIVED_DATA" \
    CODE_SIGNING_ALLOWED=NO \
    CODE_SIGNING_REQUIRED=NO \
    CODE_SIGN_IDENTITY="" \
    archive | tail -1

APP_BUNDLE="$ARCHIVE_PATH/Products/Applications/UnmatchedCounter.app"
if [ ! -d "$APP_BUNDLE" ]; then
    echo "ERROR: archive succeeded but $APP_BUNDLE was not produced" >&2
    exit 1
fi

echo "==> Wrapping into IPA"
PAYLOAD_DIR="$BUILD_DIR/Payload"
mkdir -p "$PAYLOAD_DIR"
cp -R "$APP_BUNDLE" "$PAYLOAD_DIR/"
(cd "$BUILD_DIR" && zip -qr "$(basename "$IPA_PATH")" "Payload")
rm -rf "$PAYLOAD_DIR"

SIZE=$(du -h "$IPA_PATH" | cut -f1)
echo
echo "==> Done"
echo "    archive: $ARCHIVE_PATH"
echo "    ipa:     $IPA_PATH ($SIZE)"

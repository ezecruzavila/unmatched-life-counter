import Foundation

enum CounterUtils {
    private static let largeIncrement = 5
    private static let smallIncrement = 1
    /// After this many increments while holding we switch to the large step.
    /// Currently set to 0 so any sustained hold uses the large step
    /// (matches the Android source).
    private static let largeIncrementThreshold = 0

    static func amountChange(forHoldIteration increments: Int) -> Int {
        return increments <= largeIncrementThreshold ? smallIncrement : largeIncrement
    }
}

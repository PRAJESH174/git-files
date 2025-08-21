function OptionSetAddRemove(executionContext) {
    var formContext = executionContext.getFormContext();

    // Get selected states (multi-select option set)
    var selectedStates = formContext.getAttribute("new_states").getValue(); // multi-select OptionSet

    var districtControl = formContext.getControl("new_districts");
    var allDistrictOptions = districtControl.getAttribute().getOptions();

    districtControl.clearOptions();

    if (!selectedStates || selectedStates.length === 0) return;

    // Define related districts for each state value
    var stateDistrictMap = {
        100000000: [100000004, 100000005], // Example: Andhra Pradesh
        100000001: [100000006, 100000007], // Telangana
        100000002: [100000000, 100000001, 100000002, 100000003], // Karnataka
        100000003: [100000012, 100000013], // Kerala
        100000004: [100000008, 100000009], // Tamil Nadu
        100000005: [100000010, 100000011], // Maharashtra
        100000006: [100000014, 100000015, 100000016], // Gujarat
        100000007: [100000017, 100000018], // Rajasthan
        100000008: [100000019, 100000020, 100000021], // MP
        100000009: [100000022, 100000023, 100000024]  // UP
    };

    // Collect all valid district values based on selected states
    var validDistrictValues = [];

    selectedStates.forEach(function (stateVal) {
        if (stateDistrictMap[stateVal]) {
            validDistrictValues = validDistrictValues.concat(stateDistrictMap[stateVal]);
        }
    });

    // Remove duplicates
    validDistrictValues = [...new Set(validDistrictValues)];

    // Add only the valid district options
    allDistrictOptions.forEach(function (option) {
        if (validDistrictValues.includes(option.value)) {
            districtControl.addOption(option);
        }
    });
}

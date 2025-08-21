function filterCountryByRegions(executionContext) {
    var formContext = executionContext.getFormContext();
    var selectedRegions = formContext.getAttribute("kp_region").getValue(); // Now an array of selected region values

    var countryControl = formContext.getControl("kp_count");
    var countryAttribute = formContext.getAttribute("kp_count");
    var optionSetValues = countryAttribute.getOptions();

    countryControl.clearOptions();

    if (!selectedRegions || selectedRegions.length === 0) return;

    // Mapping of Region to Countries
    var regionToCountryMap = {
        1: [1, 2,], // LATAM
        2: [3], // WESTERN EUROPE
        3: [4], // APAC
        4: [5], // NAM
        5: [6], // EASTERN EUROPE
        6: [7] // MIDDLE EAST
    };

    // Get allowed countries based on all selected regions
    var allowedCountries = [];
    selectedRegions.forEach(function (region) {
        var countries = regionToCountryMap[region];
        if (countries) {
            allowedCountries = allowedCountries.concat(countries);
        }
    });

    // Remove duplicates
    allowedCountries = [...new Set(allowedCountries)];

    // Add matching countries to the dropdown
    optionSetValues.forEach(function (element) {
        if (allowedCountries.includes(element.value)) {
            countryControl.addOption(element);
        }
    });
}

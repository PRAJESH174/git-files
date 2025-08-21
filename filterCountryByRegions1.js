function filterCountryByRegions(executionContext) {
    debugger; // Debugger added for troubleshooting
    try {
        const formContext = executionContext.getFormContext();
        
        // Validate form controls
        const regionAttribute = formContext.getAttribute("kp_region");
        if (!regionAttribute) throw new Error("kp_region attribute not found");
        
        const countryControl = formContext.getControl("kp_count");
        const countryAttribute = formContext.getAttribute("kp_count");
        if (!countryControl || !countryAttribute) throw new Error("kp_count control/attribute not found");
        
        // Get selected regions (handle null/undefined)
        const selectedRegions = regionAttribute.getValue() || [];
        const optionSetValues = countryAttribute.getOptions();
        
        // Clear existing options
        countryControl.clearOptions();
        
        // Region to Country mapping (corrected structure)
        const regionToCountryMap = {
            124050000: [124050000, 124050004, 124050016], // LATAM
            124050001: [124050001, 124050002, 124050005, 124050007, 124050008, 124050009, 124050010, 124050012, 124050014, 124050018, 124050019, 124050027], // WESTERN EUROPE
            124050002: [124050002, 124050012, 124050013, 124050017, 124050020, 124050025], // APAC
            124050003: [124050005, 124050028], // NAM
            124050004: [124050007, 124050021, 124050023], // EASTERN EUROPE
            124050005: [124050024, 124050026] // MIDDLE EAST
        };
        
        // Process selected regions
        if (selectedRegions.length > 0) {
            const allowedCountries = new Set();
            
            selectedRegions.forEach(region => {
                if (regionToCountryMap[region]) {
                    regionToCountryMap[region].forEach(country => {
                        allowedCountries.add(country);
                    });
                }
            });
            
            // Add valid country options
            optionSetValues.forEach(option => {
                if (allowedCountries.has(option.value)) {
                    countryControl.addOption(option);
                }
            });
        }
    } catch (error) {
        console.error("filterCountryByRegions error:", error.message);
        Xrm.Navigation.openErrorDialog({ message: error.message });
    }
}

function onFormLoad(executionContext) {
    filterCountryByRegions(executionContext);
}
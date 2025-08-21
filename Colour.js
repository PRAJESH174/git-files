function setFieldColours(executionContext) {
    var formContext = executionContext.getFormContext();

    // Replace these logical names with your real field names
    var orgNumberField = formContext.getControl("orgNumber");
    var numberOfEmployeesField = formContext.getControl("numberofemployees");

    if (numberOfEmployeesField) {
        numberOfEmployeesField.setControlStyle({ "background-color": "#FFAD77" }); // rgb(255,173,119)
    }

    if (orgNumberField) {
        orgNumberField.setControlStyle({ "background-color": "#A5F1A9" }); // rgb(165,241,169)
    }
}


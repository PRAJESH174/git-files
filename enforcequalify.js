function enforceQualifyStageRequirements(executionContext) {
    var formContext = executionContext.getFormContext();

    // Define the fields to make required in Qualify stage
    var requiredFields = [
        "firstname",
        "lastname",
        "initialcommunication",
        "ph_regionpresence",
        "ph_countrypresence",
        "ph_activedigitalmarketing",
        "ph_marketingteam"
    ];

    // Helper to set required and notification
    function setRequiredFields(isRequired) {
        requiredFields.forEach(function(fieldName) {
            var field = formContext.getAttribute(fieldName);
            var control = formContext.getControl(fieldName);

            if (field) {
                field.setRequiredLevel(isRequired ? "required" : "none");
            }
            if (control) {
                if (isRequired) {
                    control.setNotification("This field is required in Qualify stage.");
                } else {
                    control.clearNotification();
                }
            }
        });
    }

    // Check current stage and enforce requirements
    var activeStage = formContext.data.process.getActiveStage();
    if (!activeStage) {
        setRequiredFields(false);
        return;
    }

    var stageName = activeStage.getName();

    if (stageName === "Qualify") {
        setRequiredFields(true);

        // Only add the onSave handler once
        if (!formContext.getFormData()._enforceQualifyStageOnSaveHandlerAdded) {
            formContext.data.entity.addOnSave(function (context) {
                var eventArgs = context.getEventArgs();
                var isValid = true;
                requiredFields.forEach(function(fieldName) {
                    var field = formContext.getAttribute(fieldName);
                    if (!field || field.getValue() === null || field.getValue() === "") {
                        isValid = false;
                        var control = formContext.getControl(fieldName);
                        if (control) {
                            control.setNotification("This field is required in Qualify stage.");
                        }
                    }
                });
                if (!isValid) {
                    eventArgs.preventDefault();
                    formContext.ui.setFormNotification("Please fill all mandatory fields before qualifying the lead.", "ERROR", "QualifyStageError");
                } else {
                    formContext.ui.clearFormNotification("QualifyStageError");
                }
            });
            formContext.getFormData()._enforceQualifyStageOnSaveHandlerAdded = true;
        }
    } else {
        setRequiredFields(false);
        formContext.ui.clearFormNotification("QualifyStageError");
    }
}

// To auto-apply logic when stage changes, register this function on Business Process Flow stage change event:
// e.g. On BPF "OnStageChange" event: enforceQualifyStageRequirements
// Also, register on form OnLoad event to enforce requirements on initial load.

// Register this function on form load to prevent stage change if required fields are incomplete
function registerStageChangeValidator(executionContext) {
    const formContext = executionContext.getFormContext();
    formContext.data.process.addOnPreStageChange(preventStageChange);
}

// Main function to validate required fields before stage change
function preventStageChange(executionContext) {
    const formContext = executionContext.getFormContext();
    const process = formContext.data.process;
    const activeStage = process.getActiveStage();

    if (!activeStage) return;

    const activeStageId = activeStage.getId();
    const eventArgs = executionContext.getEventArgs();
    const nextStage = eventArgs.getNextStage();

    if (!nextStage) return;

    //  Check if stage movement is backward — no validation needed
    const activeStageIndex = process.getStages().findIndex(stage => stage.getId() === activeStageId);
    const nextStageIndex = process.getStages().findIndex(stage => stage.getId() === nextStage.getId());

    if (nextStageIndex <= activeStageIndex) {
        return; // moving backward or to same stage: allow
    }

    // Stage-specific required field configurations
    const stageValidationConfig = {

        // Develop Stage
        "bfc9108c-8389-406b-9166-2c3298a2e41f": {
            fields: [
                "ph_discoverymeeting",
                "ph_needsfitidentified",
                "ph_followupemail"
            ],
            alertText: "Please complete Discovery Meeting, Needs & Fit Identified, and Follow-up Email before proceeding."
        },

        // Propose Stage
        "3a275c22-fc45-4e89-97fc-41e5ec578743": {
            fields: [
                "ph_initialproposalshared",
                "ph_proposalfinalised",
                "ph_informalverbalagreement"
            ],
            alertText: "Please complete Initial Proposal, Proposal Finalised, and Verbal Agreement before proceeding."
        },

        // Contract Stage
        "7f5247fe-cfc3-42bc-aa77-b1d836d9b7c0": {
            fields: [
                "ph_createmsa",
                "ph_msaprivacylegalcheck",
                "ph_msasigned",
                "ph_kickoffoperations"
            ],
            alertText: "Please complete MSA options and Kick-Off Operations before proceeding."
        }
    };

    // Get the current stage's validation configuration
    const stageConfig = stageValidationConfig[activeStageId];
    if (!stageConfig) return;

    //  Check if any of the required fields are empty
    const isIncomplete = stageConfig.fields.some(field => {
        const attribute = formContext.getAttribute(field);
        if (!attribute) return true;

        const value = attribute.getValue();
        return value === null || value === undefined || value === "";
    });

    // Prevent stage change and show alert if validation fails
    if (isIncomplete) {
        eventArgs.preventDefault();
        Xrm.Navigation.openAlertDialog({ text: stageConfig.alertText });
    }
}

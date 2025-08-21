function restrictAccountNameField(executioncontext) {
    var formcontext = executioncontext.getFormContext();
    var currentUserId = Xrm.Utility.getGlobalContext().userSettings.userId.toLowerCase();
    var allowedUserId = "{11111111-2222-3333-4444-555555555555}".toLowerCase();

    if (currentUserId !== allowedUserId) {
        formcontext.getControl("name").setVisible(false);
        formcontext.getAttribute("name").setValue("");
    }
}
function onLoad(executioncontext) {
    var formcontext = executioncontext.getFormContext();
    var formType = formcontext.ui.getFormType();

    if (formType === 1 || formType === 2) { // Check if the form is Create or Update
        restrictAccountNameField(executioncontext);
    }
}
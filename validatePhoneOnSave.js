function validatePhoneOnSave(executionContext) {
    debugger; // Enable debugging to inspect the form context and attributes
    var formContext = executionContext.getFormContext();
    var phoneAttr = formContext.getAttribute("telephone1");

    if (phoneAttr) {
        var phone = phoneAttr.getValue();

        // Validate 10-digit number
        if (phone && !phone.match(/^\d{10}$/)) {
            var eventArgs = executionContext.getEventArgs();
            eventArgs.preventDefault(); // Stop the save
            Xrm.Navigation.openAlertDialog({
                text: "Please enter a valid phone number containing exactly 10 digits."
            });
            return;
        }

        // Apply masking rule: show only last 4 digits
        if (phone) {
            var last4Digits = phone.slice(-4);
            var maskedPhone = "******" + last4Digits; // Output: ******1234
            formContext.getAttribute("telephone1").setValue(maskedPhone);
        }
    }
}

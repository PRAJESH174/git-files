function openNetworkingActivityForm() {
    // Define the entity name
    var entityName = "jmi_networking";
  
    // Define the parameters for window.open() or Xrm.Navigation.openForm()
  
    // Option 1: Using window.open() (Simpler, but less integrated)
    // var windowOptions = "width=800,height=600,resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no";
    // var formUrl = Xrm.Utility.getGlobalContext().getClientUrl() +
    //               "/main.aspx?etn=" + entityName +
    //               "&pagetype=entityrecord";
    // window.open(formUrl, "_blank", windowOptions);
  
    // Option 2: Using Xrm.Navigation.openForm() (More integrated with Dynamics 365)
    var formParameters = {
      entityName: entityName
    };
  
    Xrm.Navigation.openForm(formParameters).then(
      function (success) {
        console.log("Networking Activity form opened successfully.");
      },
      function (error) {
        console.error("Error opening Networking Activity form:", error);
      }
    );
  }
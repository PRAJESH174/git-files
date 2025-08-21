function Onload(econtext)
{
   Xrm.Page.getAttribute("jmi_fundname").addOnChange(FundChange);
   Xrm.Page.getAttribute("new_potentialinvester").addOnChange(InvestorChange);
   Xrm.Page.getAttribute("new_primarycontact").addOnChange(ContactChange);
}



function InvestorChange()
{
debugger;
   var investorid;
   var lookupItem=Xrm.Page.getAttribute("new_potentialinvester").getValue();
   if(lookupItem != null)
   {
       investorid = lookupItem[0].id;
       investorid= investorid.replace(/[{()}]/g,'');
   }
   else
   {
     investorid=null;
   }
   
   
   if(investorid!=null)
   {
   
   console.log(investorid);
        var req = new XMLHttpRequest();
        req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v9.1/accounts("+investorid+")?$select=new_investortype", false);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        req.send();
         if (req.status === 200) 
                {
                debugger;
                    var result = JSON.parse(req.response);
                     var new_investortype = result["new_investortype"];
                     var new_investortype_formatted = result["new_investortype@OData.Community.Display.V1.FormattedValue"];
                    Xrm.Page.getAttribute("new_investertype").setValue(new_investortype);
                } 
            else {
                    Xrm.Utility.alertDialog(this.statusText);
                }  
           }
}

function ContactChange()
{
  
  var contactid;
  var lookupItem=Xrm.Page.getAttribute("new_primarycontact").getValue();
   if(lookupItem != null)
   {
       contactid = lookupItem[0].id;
       contactid= contactid.replace(/[{()}]/g,'');
   }
   else
   {
    contactid=null;
   }
   
   debugger;
   if(contactid!=null)
   {
   console.log(contactid);
               var req = new XMLHttpRequest();
                req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v9.1/contacts("+contactid+")?$select=emailaddress1,mobilephone,telephone1,jobtitle", false);
                req.setRequestHeader("OData-MaxVersion", "4.0");
                req.setRequestHeader("OData-Version", "4.0");
                req.setRequestHeader("Accept", "application/json");
                req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
                req.send();
                if (req.status === 200) 
                    {
                    debugger;
                            var result = JSON.parse(req.response);
                            var emailaddress1 = result["emailaddress1"];
                            var jobtitle = result["jobtitle"];
                            var mobilephone = result["mobilephone"];
                            var telephone1 = result["telephone1"];
                            Xrm.Page.getAttribute("new_jobtitle").setValue(jobtitle);
                            Xrm.Page.getAttribute("new_email").setValue(emailaddress1);
                            Xrm.Page.getAttribute("new_businessphone").setValue(telephone1);
                             Xrm.Page.getAttribute("new_mobilephone").setValue(mobilephone);
                            
                        } 
                        else 
                        {
                            Xrm.Utility.alertDialog(this.statusText);
                        }
              
                
   }
}




function FundChange()
{

var fundid;
    var lookupItem = Xrm.Page.getAttribute("jmi_fundname").getValue();
	if (lookupItem != null)
	{
		fundid = lookupItem[0].id;
       fundid= fundid.replace(/[{()}]/g,'');
	}
    else
    {
    fundid=null;
    }
if(fundid!=null)
{
console.log(fundid);
    var req = new XMLHttpRequest();
req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v9.1/jmi_funds("+fundid+")?$select=jmi_fundclosedate,jmi_fundlaunchdate,jmi_fundtarget,jmi_fundtype", false);
req.setRequestHeader("OData-MaxVersion", "4.0");
req.setRequestHeader("OData-Version", "4.0");
req.setRequestHeader("Accept", "application/json");
req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
req.send();
if (req.status === 200)
         {
            
            debugger;
            var result = JSON.parse(req.response);
            var jmi_fundclosedate = result["jmi_fundclosedate"];
            var jmi_fundlaunchdate = result["jmi_fundlaunchdate"];
            var jmi_fundtarget = result["jmi_fundtarget"];
            var jmi_fundtarget_formatted = result["jmi_fundtarget@OData.Community.Display.V1.FormattedValue"];
            var jmi_fundtype = result["jmi_fundtype"];
            var jmi_fundtype_formatted = result["jmi_fundtype@OData.Community.Display.V1.FormattedValue"];
            
            var jmi_fundlaunchdate=new Date(new_fundlaunchdate);
            var jmi_fundclosedate=new Date(new_fundclosedate);
            Xrm.Page.getAttribute('jmi_fundlaunchdate').setValue(jmi_fundlaunchdate);
            Xrm.Page.getAttribute('jmi_fundclosedate').setValue(jmi_fundclosedate);
            Xrm.Page.getAttribute("jmi_fundtype").setValue(jmi_fundtype);
            Xrm.Page.getAttribute("jmi_fundtarget").setValue(jmi_fundtarget);
        } 
        else
         {
            Xrm.Utility.alertDialog(req.statusText);
        }
}

}
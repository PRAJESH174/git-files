//javascript sourc code
function alertaccountname(executioncontext)
{
    //if the code is more then 100s of lines we will use(debugger;)itwill resolve the script errors in the code 
    debugger;
    // read object formcontext
    var formcontext = executioncontext.getformcontext();

    //read accontname value
    var accountname = formcontext.getattribute("name").getvalue();

    //set Fax number xyz
    formcontext.getattribute("fax").setvalue("xyz");

    // display accountname in a pop-up widow
    alert("welcome" + accountname);
}
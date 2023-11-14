async function resetPassphrase()
{
    if (document.querySelector("#email").value.length === 0) openDialog("missing-user-info");
    else
    {
        // Gets values of email field
        const email = document.querySelector("#email").value.toString();

        // Gets user from API
        axios({
            method: 'post',
            url: api + 'user/reset-passphrase',
            data: {
                email: email
            }
        });
    }
}

// Get the URL parameters
const urlParams = new URLSearchParams(window.location.search);
const resetToken = urlParams.get('resetToken');

// A resetToken was provided. This means that the user is navigating to the page after receiving the reset email
if (resetToken) document.querySelector("#new-passphrase-form").classList.remove("hidden");
else document.querySelector("#form").classList.remove("hidden");

async function resetPassphrase()
{
    if (document.querySelector("#email").value.length === 0) openDialog("missing-user-info");
    else
    {
        // Gets values of email field
        const email = document.querySelector("#email").value.toString();

        // Send data to API
        axios({
            method: 'post',
            url: api + 'user/request-passphrase-reset',
            data: {
                email: email
            }
        });
    }
}

async function confirmNewPassphrase()
{
    if (document.querySelector("#passphrase").value.length === 0 || document.querySelector("#confirm-passphrase").value.length === 0) openDialog("missing-user-info");
    else
    {
        // Get values
        const passphrase = document.querySelector("#passphrase").value.toString();
        const passphraseConfirm = document.querySelector("#confirm-passphrase").value.toString();

        if (passphrase !== passphraseConfirm) openDialog("passphrases-must-match");
        else
        {
            // Send data to API
            axios({
                method: 'post',
                url: api + 'user/reset-passphrase',
                data: {
                    resetToken: resetToken,
                    newPassphrase: passphrase
                }
            });
        }
    }
}

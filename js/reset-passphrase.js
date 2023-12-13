// Get the URL parameters
const urlParams = new URLSearchParams(window.location.search);
const resetToken = urlParams.get('resetToken');

// A resetToken was provided. This means that the user is navigating to the page after receiving the reset email
if (resetToken) document.querySelector("#new-passphrase-form").classList.remove("hidden");
else document.querySelector("#form").classList.remove("hidden");

// Function for requesting a passphrase reset from the API
async function resetPassphrase()
{
    // Check if the email field is empty
    if (document.querySelector("#email").value.length === 0) openDialog("missing-user-info"); // Show error: the email field is empty
    else
    {
        // Get values of email field
        const email = document.querySelector("#email").value.toString();

        // Send data to API
        axios({
            method: 'post',
            url: api + 'user/request-passphrase-reset',
            data: {
                email: email
            }
        });

        // Show success dialog
        openDialog("email-success");
    }
}

// Function to set a new passphrase with a reset token provided by the API
async function confirmNewPassphrase()
{
    // Check if the passphrase fields have values
    if (document.querySelector("#passphrase").value.length === 0 || document.querySelector("#confirm-passphrase").value.length === 0) openDialog("passphrases-must-match");
    else
    {
        // Get values
        const passphrase = document.querySelector("#passphrase").value.toString();
        const passphraseConfirm = document.querySelector("#confirm-passphrase").value.toString();

        // Check if the passphrases match
        if (passphrase !== passphraseConfirm) openDialog("passphrases-must-match");
        else
        {
            // Send data to API
            const success = (await axios({
                method: 'post',
                url: api + 'user/reset-passphrase',
                data: {
                    resetToken: resetToken,
                    newPassphrase: passphrase
                }
            })).data;

            // Show success or error based on the result
            if (success) openDialog("success");
            else openDialog("invalid-reset-token");
        }
    }
}

// ===============================
// Google Apps Script Web App URL
// ===============================
console.log("contact.js loaded");
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzzboMJDDq5SOvHAf5-DMrMCkJwclpqlua10DFuyk8MedphTFgRJXiM17ATfolj0YX4/exec";

// ===============================
// Phone Input
// ===============================
const phoneInput = window.intlTelInput(document.querySelector("#phone"), {
    initialCountry: "lk",
    preferredCountries: ["lk", "in", "us", "gb"],
    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
});

// ===============================
// Clear Concern
// ===============================
const concernTextarea = document.getElementById("concern");
const clearBtn = document.getElementById("clear-btn");

clearBtn.addEventListener("click", () => {

    if (concernTextarea.value.trim() !== "") {

        concernTextarea.classList.add("text-fade-out");

        setTimeout(() => {

            concernTextarea.value = "";
            concernTextarea.classList.remove("text-fade-out");
            concernTextarea.focus();

        },300);

    }

});

// ===============================
// Submit Form
// ===============================
document.getElementById("contactForm").addEventListener("submit", async function(e){

    e.preventDefault();

    const btn = document.getElementById("submitBtn");

    btn.disabled = true;
    btn.innerHTML = "Sending...";

    const data = {

        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        phone: "+" +
       phoneInput.getSelectedCountryData().dialCode +
       document.getElementById("phone").value.replace(/\D/g, ""),
        email: document.getElementById("email").value.trim(),
        service: document.getElementById("service").value,
        concern: document.getElementById("concern").value.trim()

    };

    try{

        const response = await fetch(SCRIPT_URL,{
            method:"POST",
            headers:{
                "Content-Type":"text/plain;charset=utf-8"
            },
            body:JSON.stringify(data)
        });

        const result = await response.json();

        if(result.success){

            alert("Thank you! Your enquiry has been submitted.");

            document.getElementById("contactForm").reset();

            phoneInput.setCountry("lk");

        }else{

            alert(result.message);

        }

    }catch(error){

        console.error(error);

        alert("Unable to send enquiry.");

    }

    btn.disabled=false;
    btn.innerHTML="Submit";

});
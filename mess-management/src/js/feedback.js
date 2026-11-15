/* =========================================================
   MESS MANAGEMENT SYSTEM
   FEEDBACK JAVASCRIPT
   ========================================================= */


/* =========================================================
   GET HTML ELEMENTS
   ========================================================= */

const feedbackForm =
    document.getElementById("feedbackForm");

const feedbackMessage =
    document.getElementById("feedbackMessage");

const stars =
    document.querySelectorAll(".star-rating button");

const emojis =
    document.querySelectorAll(".feedback-emoji");

const categories =
    document.querySelectorAll(".category-button");


/* =========================================================
   VARIABLES
   ========================================================= */

let selectedRating = 0;

let selectedCategory = "";

let selectedFeeling = "";


/* =========================================================
   STAR RATING
   ========================================================= */

stars.forEach(function (star) {

    star.addEventListener("click", function () {

        selectedRating =
            Number(this.getAttribute("data-rating"));


        stars.forEach(function (item) {

            const rating =
                Number(item.getAttribute("data-rating"));

            if (rating <= selectedRating) {

                item.classList.add("active");

            } else {

                item.classList.remove("active");

            }

        });

    });

});


/* =========================================================
   EMOJI SELECTION
   ========================================================= */

emojis.forEach(function (emoji) {

    emoji.addEventListener("click", function () {

        selectedFeeling =
            this.getAttribute("data-feeling");


        emojis.forEach(function (item) {

            item.classList.remove("selected");

        });


        this.classList.add("selected");

    });

});


/* =========================================================
   CATEGORY SELECTION
   ========================================================= */

categories.forEach(function (category) {

    category.addEventListener("click", function () {

        selectedCategory =
            this.getAttribute("data-category");


        categories.forEach(function (item) {

            item.classList.remove("active");

        });


        this.classList.add("active");

    });

});


/* =========================================================
   SUBMIT FEEDBACK
   ========================================================= */

feedbackForm.addEventListener(
    "submit",
    function (event) {

        /* STOP NORMAL FORM SUBMISSION */

        event.preventDefault();


        /* GET MESSAGE */

        const feedbackText =
            document
                .getElementById("feedbackText")
                .value
                .trim();


        /* =================================================
           VALIDATION
           ================================================= */


        if (selectedRating === 0) {

            showMessage(
                "Please select a star rating.",
                "error"
            );

            return;
        }


        if (selectedCategory === "") {

            showMessage(
                "Please select a feedback category.",
                "error"
            );

            return;
        }


        if (feedbackText === "") {

            showMessage(
                "Please write your feedback.",
                "error"
            );

            return;
        }


        /* =================================================
           GET CURRENT USER
           ================================================= */

        let currentUser = null;

        try {

            currentUser =
                JSON.parse(
                    localStorage.getItem("currentUser")
                );

        } catch (error) {

            console.log(
                "Current user not available."
            );

        }


        /* =================================================
           GET OLD FEEDBACK
           ================================================= */

        let feedbacks = [];

        try {

            feedbacks =
                JSON.parse(
                    localStorage.getItem(
                        "messFeedbacks"
                    )
                ) || [];

        } catch (error) {

            feedbacks = [];

        }


        /* =================================================
           CREATE NEW FEEDBACK
           ================================================= */

        const newFeedback = {

            id: Date.now(),

            username:
                currentUser
                    ? currentUser.username
                    : "Guest",

            name:
                currentUser
                    ? currentUser.name
                    : "Guest",

            rating:
                selectedRating,

            feeling:
                selectedFeeling,

            category:
                selectedCategory,

            message:
                feedbackText,

            date:
                new Date().toLocaleString()

        };


        /* =================================================
           ADD FEEDBACK
           ================================================= */

        feedbacks.push(newFeedback);


        /* =================================================
           SAVE FEEDBACK
           ================================================= */

        localStorage.setItem(
            "messFeedbacks",
            JSON.stringify(feedbacks)
        );


        /* =================================================
           SUCCESS MESSAGE
           ================================================= */

        showMessage(
            "âœ“ Feedback submitted successfully!",
            "success"
        );


        /* =================================================
           RESET FORM
           ================================================= */

        feedbackForm.reset();

        selectedRating = 0;

        selectedCategory = "";

        selectedFeeling = "";


        stars.forEach(function (star) {

            star.classList.remove("active");

        });


        emojis.forEach(function (emoji) {

            emoji.classList.remove("selected");

        });


        categories.forEach(function (category) {

            category.classList.remove("active");

        });


        /* =================================================
           RETURN TO DASHBOARD
           ================================================= */

        setTimeout(function () {

            window.location.href =
                "dashboard.html";

        }, 1500);

    }
);


/* =========================================================
   SHOW MESSAGE
   ========================================================= */

function showMessage(message, type) {

    feedbackMessage.textContent = message;


    if (type === "success") {

        feedbackMessage.style.color =
            "#16a34a";

        feedbackMessage.style.background =
            "#dcfce7";

        feedbackMessage.style.padding =
            "10px";

        feedbackMessage.style.borderRadius =
            "8px";

    } else {

        feedbackMessage.style.color =
            "#dc2626";

        feedbackMessage.style.background =
            "#fee2e2";

        feedbackMessage.style.padding =
            "10px";

        feedbackMessage.style.borderRadius =
            "8px";

    }

}


/* =========================================================
   LOGOUT
   ========================================================= */

function logout() {

    localStorage.removeItem("currentUser");

}

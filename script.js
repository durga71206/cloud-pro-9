// ===============================
// FIREBASE APP
// ===============================

import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


// ===============================
// FIREBASE AUTHENTICATION
// ===============================

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ===============================
// FIRESTORE
// ===============================

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ===============================
// FIREBASE CONFIGURATION
// ===============================

const firebaseConfig = {

    apiKey: "AIzaSyADNr9jlKXiv7LoI2CYHxKTVu1-tTjmO5w",

    authDomain: "cloudpetcare-63a04.firebaseapp.com",

    projectId: "cloudpetcare-63a04",

    storageBucket: "cloudpetcare-63a04.firebasestorage.app",

    messagingSenderId: "54459487062",

    appId: "1:54459487062:web:d0fd1f3896eb454171bcf7"

};


// ===============================
// INITIALIZE FIREBASE
// ===============================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// ===============================
// REGISTER
// ===============================

window.register = async function () {

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value.trim();

    const message =
        document.getElementById("message");


    if (email === "" || password === "") {

        message.innerText =
            "Please enter email and password.";

        message.style.color = "red";

        return;
    }


    if (password.length < 6) {

        message.innerText =
            "Password must contain at least 6 characters.";

        message.style.color = "red";

        return;
    }


    try {

        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );


        message.innerText =
            "Account created successfully!";

        message.style.color = "green";


    } catch (error) {

        console.error("Registration Error:", error);

        if (error.code === "auth/email-already-in-use") {

            message.innerText =
                "This email is already registered.";

        } else if (error.code === "auth/invalid-email") {

            message.innerText =
                "Please enter a valid email.";

        } else {

            message.innerText =
                error.message;
        }

        message.style.color = "red";
    }

};


// ===============================
// LOGIN
// ===============================

window.login = async function () {

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value.trim();

    const message =
        document.getElementById("message");


    if (email === "" || password === "") {

        message.innerText =
            "Please enter email and password.";

        message.style.color = "red";

        return;
    }


    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );


        message.innerText =
            "Login successful!";

        message.style.color = "green";


    } catch (error) {

        console.error("Login Error:", error);


        if (
            error.code === "auth/invalid-credential" ||
            error.code === "auth/wrong-password" ||
            error.code === "auth/user-not-found"
        ) {

            message.innerText =
                "Invalid email or password.";

        } else if (error.code === "auth/invalid-email") {

            message.innerText =
                "Please enter a valid email.";

        } else {

            message.innerText =
                error.message;
        }

        message.style.color = "red";
    }

};


// ===============================
// LOGOUT
// ===============================

window.logout = async function () {

    try {

        await signOut(auth);

    } catch (error) {

        console.error("Logout Error:", error);

    }

};


// ===============================
// CHECK USER LOGIN STATUS
// ===============================

onAuthStateChanged(auth, (user) => {

    const loginSection =
        document.getElementById("loginSection");

    const dashboardSection =
        document.getElementById("dashboardSection");


    if (user) {

        loginSection.classList.add("hidden");

        dashboardSection.classList.remove("hidden");

        loadAppointments();

    } else {

        loginSection.classList.remove("hidden");

        dashboardSection.classList.add("hidden");

    }

});


// ===============================
// BOOK APPOINTMENT
// ===============================

window.bookAppointment = async function () {

    const petName =
        document.getElementById("petName").value.trim();

    const petType =
        document.getElementById("petType").value;

    const breed =
        document.getElementById("breed").value.trim();

    const age =
        document.getElementById("age").value;

    const service =
        document.getElementById("service").value;

    const date =
        document.getElementById("appointmentDate").value;

    const time =
        document.getElementById("appointmentTime").value;

    const reason =
        document.getElementById("reason").value.trim();


    if (
        petName === "" ||
        petType === "" ||
        breed === "" ||
        age === "" ||
        service === "" ||
        date === "" ||
        time === "" ||
        reason === ""
    ) {

        alert("Please fill all fields.");

        return;
    }


    const user = auth.currentUser;


    if (!user) {

        alert("Please login first.");

        return;
    }


    try {

        await addDoc(
            collection(db, "appointments"),
            {

                petName: petName,

                petType: petType,

                breed: breed,

                age: Number(age),

                service: service,

                date: date,

                time: time,

                reason: reason,

                ownerEmail: user.email,

                userId: user.uid,

                status: "Pending",

                createdAt: serverTimestamp()

            }
        );


        alert(
            "Appointment booked successfully!"
        );


        // Clear form

        document.getElementById("petName").value = "";

        document.getElementById("petType").value = "";

        document.getElementById("breed").value = "";

        document.getElementById("age").value = "";

        document.getElementById("service").value = "";

        document.getElementById("appointmentDate").value = "";

        document.getElementById("appointmentTime").value = "";

        document.getElementById("reason").value = "";


        // Reload appointments

        loadAppointments();


    } catch (error) {

        console.error("Appointment Error:", error);

        alert(
            "Error booking appointment: "
            + error.message
        );

    }

};


// ===============================
// LOAD APPOINTMENTS
// ===============================

async function loadAppointments() {

    const appointmentList =
        document.getElementById("appointmentList");

    const user = auth.currentUser;


    if (!user) {

        return;
    }


    appointmentList.innerHTML =
        "<p>Loading appointments...</p>";


    try {

        const q = query(

            collection(db, "appointments"),

            where(
                "userId",
                "==",
                user.uid
            )

        );


        const snapshot =
            await getDocs(q);


        appointmentList.innerHTML = "";


        if (snapshot.empty) {

            appointmentList.innerHTML =
                "<p>No appointments available.</p>";

            return;
        }


        snapshot.forEach((doc) => {

            const appointment =
                doc.data();


            const card =
                document.createElement("div");


            card.className =
                "appointment-card";


            card.innerHTML = `

                <h3>
                    🐾 ${appointment.petName}
                </h3>

                <p>
                    <strong>Pet Type:</strong>
                    ${appointment.petType}
                </p>

                <p>
                    <strong>Breed:</strong>
                    ${appointment.breed}
                </p>

                <p>
                    <strong>Age:</strong>
                    ${appointment.age}
                </p>

                <p>
                    <strong>Service:</strong>
                    ${appointment.service}
                </p>

                <p>
                    <strong>Date:</strong>
                    ${appointment.date}
                </p>

                <p>
                    <strong>Time:</strong>
                    ${appointment.time}
                </p>

                <p>
                    <strong>Reason:</strong>
                    ${appointment.reason}
                </p>

                <span class="status">
                    ${appointment.status}
                </span>

            `;


            appointmentList.appendChild(card);

        });


    } catch (error) {

        console.error(
            "Load Appointment Error:",
            error
        );

        appointmentList.innerHTML =
            "<p>Unable to load appointments.</p>";

    }

}
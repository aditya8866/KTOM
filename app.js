const dotenv = require("dotenv");
dotenv.config();
const express = require("express")
const app = express();
const userModel = require("./models/user")
const mongooseConnection = require("./configs/db")

app.use(express.static('public'));
app.set("view engine", "ejs")
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const session = require("express-session");

app.use(session({
    secret: "kuchbhi",  // replace with a strong secret in real apps
    resave: false,
    saveUninitialized: true
}));


app.get("/", (req, res, next) => {
    res.render("homepage")
})

app.get("/login", (req, res, next) => {
    res.render("login")
})

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt:", email, password);

    try {
        const user = await userModel.findOne({ email, password });

        if (!user) {
            return res.send(`
                <h1 class="text-5xl font-bold">Invalid Email or Password!! Redirecting to Login Page in 3 seconds...</h1>
                <script>
                    setTimeout(() => { window.location.href = "/login" }, 3000);
                </script>
            `);  // ✅ Added return to stop further execution
        }

        req.session.isUserLoggedIn = true;
        req.session.user = user;
        return res.redirect("dashboard");  // ✅ Added return here too (best practice)
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).send("Error while logging in.");  // ✅ return for consistency
    }
});

app.get("/logOut", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log('Error destroying session:', err);
            return res.status(500).send("Error logging out");
        }
        res.clearCookie('connect.sid');  // Optional but recommended
        res.redirect('/');
    });
});



app.get("/signup", (req, res, next) => {
    res.render("signUp")
})

app.post("/signup", async (req, res, next) => {
    let { email, password } = req.body;

    try {
        const newUser = await userModel.create({
            email,
            password
        })
        res.send(`
            <p class="text-5xl font-bold">Signup successful! Redirecting to homepage...</p>
            <script>
            setTimeout(() => { window.location.href = "/" }, 1000);
            </script>`);

    } catch (err) {
        if (err.code === 11000 && err.keyPattern?.email) {
            return res.status(400).send(`<h1 class="text-5xl font-bold">This email is already registered. Redirecting to home Page in 2 seconds...</h1>
                <script>
                    setTimeout(() => { window.location.href = "/" }, 2000);
                </script>`);
        }

        console.error("Signup failed:", err);
        res.status(500).send("An error occurred during signup. Try again later.");
    }
})

app.get("/dashboard", async (req, res, next) => {
    if (!req.session.user) {
        return res.send(`<h1>Cannot access this route without login!! Redirecting to Login Page in 2 second</h1> <script>
            setTimeout(() => { window.location.href = "/login" }, 2000);
            </script>`)
    }

    if (!req.session.isUserLoggedIn) {
        return res.redirect("login")
    }

    try {
        const userId = req.session?.user?._id;
        const user = await userModel.findById(userId)
        const hisaabDetails = user.hisaabDetails;
        console.log(hisaabDetails);
        res.render("dashboard", { hisaabDetails, userId })

    } catch (err) {
        console.log(err)
        res.status(500).send("Internal Server Error");
    }
})

// app.post("/dashboard",)

app.get("/create", (req, res, next) => {
    res.render("create")
})

app.post("/create", async (req, res, next) => {
    let { title, details, isEncrypted, encryptedPassword } = req.body;
    const newHisaab = {
        title,
        detail: details,
        isEncrypted: isEncrypted === "true",
        encryptedPassword: isEncrypted === "true" ? encryptedPassword : null
    }
    try {
        const userId = req.session?.user?._id;
        if (!userId) {
            return res.status(401).send(`<h1 class="text-5xl font-bold">Unautorized: please login again.!! Redirecting to Login Page in 3 seconds...</h1>
                <script>
                    setTimeout(() => { window.location.href = "/login" }, 3000);
                </script>`);
        }
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).send("User not found.");
        }
        user.hisaabDetails.push(newHisaab);
        await user.save();
        res.redirect("/dashboard");
    } catch (err) {
        console.error("Error creating Hisaab:", err);
        res.status(500).send("Internal Server Error");
    }

    
})
app.get("/read/:userId/:hisaabId", async (req, res) => {
    const { userId, hisaabId } = req.params;

    try {
        const user = await userModel.findById(userId);
        if (!user) return res.status(404).send("User not found");

        const hisaabD = user.hisaabDetails.id(hisaabId);
        if (!hisaabD) return res.status(404).send("Hisaab not found");

        res.render('singleHisaab', { hisaabD, userID: userId });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

app.get("/edit/:userId/:hisaabID", async (req, res) => {
    const { userId, hisaabID } = req.params;

    try {
        // 1. Fetch the user
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // 2. Find the hisaab inside hisaabDetails
        const hisaab = user.hisaabDetails.id(hisaabID);  // << Mongoose's .id() method

        if (!hisaab) {
            return res.status(404).send('Hisaab not found');
        }

        // 3. Render edit view with found hisaab
        res.render('editHisaab', { user, hisaab });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.post("/edit/:userId/:hisaabId", async (req, res) => {
    const { userId, hisaabId } = req.params;
    const { title, detail } = req.body;

    try {
        // 1. Fetch the user by ID
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // 2. Find the specific hisaab inside hisaabDetails
        const hisaab = user.hisaabDetails.id(hisaabId);
        if (!hisaab) {
            return res.status(404).send('Hisaab not found');
        }

        // 3. Update the fields
        hisaab.title = title;
        hisaab.detail = detail;

        // 4. Save the updated user document
        await user.save();

        // 5. Redirect back (or wherever you prefer)
        res.redirect(`/read/${userId}/${hisaabId}`);

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.get("/delete/:userID/:hisaabId", async (req, res) => {
    const { userID, hisaabId } = req.params;

    try {
        const user = await userModel.findById(userID);
        if (!user) return res.status(404).send('User not found');

        user.hisaabDetails = user.hisaabDetails.filter(h => h._id != hisaabId);
        await user.save();

        res.redirect(`/dashboard`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting record');
    }
});

app.listen(process.env.PORT , () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
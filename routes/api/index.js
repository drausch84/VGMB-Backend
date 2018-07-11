var router = require('express').Router();

router.use("/", require ("./users"));

// registering profiles router
router.use("/profiles", require("./profiles"));

// registering articles router
router.use("/articles", require("./articles"));

// registering tags router
router.use("tags", require("./tags"));


// a middleware function for the router to handle any validation errors from Mongoose
router.use(function(err, req, res, next){
    if (err.name === "ValidationError"){
        return res.status(422).json({
            errors: Object.keys(err.errors).reduce(function(errors, key){
                errors[key] = err.errors[key].message;
                
                return errors;
            }, {})
        });
    }
    return next(err);
});

module.exports = router;

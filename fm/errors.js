var _ = require('lodash'),
    chalk = require('chalk'),
    i18n = require('./i18n');

function ValidationError(message, offendingProperty) {
    this.message = message;
    this.stack = new Error().stack;
    this.statusCode = 422;
    if (offendingProperty) {
        this.property = offendingProperty;
    }
    this.errorType = this.name;
}

ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.name = 'ValidationError';
//*****************************************************

function UnauthorizedError(message) {
    this.message = message;
    this.stack = new Error().stack;
    this.statusCode = 401;
    this.errorType = this.name;
}

UnauthorizedError.prototype = Object.create(Error.prototype);
UnauthorizedError.prototype.name = 'UnauthorizedError';
//*****************************************************

function BadRequestError(message) {
    this.message = message;
    this.stack = new Error().stack;
    this.statusCode = 400;
    this.errorType = this.name;
}

BadRequestError.prototype = Object.create(Error.prototype);
BadRequestError.prototype.name = 'BadRequestError';
//**********************************************************
function NotFoundError(message) {
    this.message = message;
    this.stack = new Error().stack;
    this.statusCode = 404;
    this.errorType = this.name;
}
NotFoundError.prototype = Object.create(Error.prototype);
NotFoundError.prototype.name = 'NotFoundError';

function MethodNotAllowedError(message) {
    this.message = message;
    this.stack = new Error().stack;
    this.statusCode = 405;
    this.errorType = this.name;
}

MethodNotAllowedError.prototype = Object.create(Error.prototype);
MethodNotAllowedError.prototype.name = 'MethodNotAllowedError';

function NoPermissionError(message) {
    this.message = message;
    this.stack = new Error().stack;
    this.statusCode = 403;
    this.errorType = this.name;
}

NoPermissionError.prototype = Object.create(Error.prototype);
NoPermissionError.prototype.name = 'NoPermissionError';

function InternalServerError(message) {
    this.message = message;
    this.stack = new Error().stack;
    this.statusCode = 500;
    this.errorType = this.name;
}

InternalServerError.prototype = Object.create(Error.prototype);
InternalServerError.prototype.name = 'InternalServerError';


function isValidErrorStatus(status) {
    return _.isNumber(status) && status >= 400 && status < 600;
}

function getStatusCode(error) {
    if (error.statusCode) {
        return error.statusCode;
    }

    if (error.status && isValidErrorStatus(error.status)) {
        error.statusCode = error.status;
        return error.statusCode;
    }

    if (error.code && isValidErrorStatus(error.code)) {
        error.statusCode = error.code;
        return error.statusCode;
    }

    error.statusCode = 500;
    return error.statusCode;
}

var errors = {
    throwError: function (err) {
        if (!err) {
            err = new Error(i18n.t('errors.errors.anErrorOccurred'));
        }

        if (_.isString(err)) {
            throw new Error(err);
        }

        throw err;
    },
    // ## Reject Error
    // Used to pass through promise errors when we want to handle them at a later time
    rejectError: function (err) {
        return Promise.reject(err);
    },

    logComponentInfo: function (component, info) {
        if ((process.env.NODE_ENV === 'development' ||
            process.env.NODE_ENV === 'staging' ||
            process.env.NODE_ENV === 'production')) {
            console.info(chalk.cyan(component + ':', info));
        }
    },

    logComponentWarn: function (component, warning) {
        if ((process.env.NODE_ENV === 'development' ||
            process.env.NODE_ENV === 'staging' ||
            process.env.NODE_ENV === 'production')) {
            console.info(chalk.yellow(component + ':', warning));
        }
    },

    logWarn: function (warn, context, help) {
        if ((process.env.NODE_ENV === 'development' ||
            process.env.NODE_ENV === 'staging' ||
            process.env.NODE_ENV === 'production')) {
            warn = warn || i18n.t('errors.errors.noMessageSupplied');
            var msgs = [chalk.yellow(i18n.t('errors.errors.warning'), warn), '\n'];

            if (context) {
                msgs.push(chalk.white(context), '\n');
            }

            if (help) {
                msgs.push(chalk.green(help));
            }

            // add a new line
            msgs.push('\n');

            console.log.apply(console, msgs);
        }
    },

    logError: function (err, context, help) {
        var self = this,
            origArgs = _.toArray(arguments).slice(1),
            stack,
            msgs;

        if (_.isArray(err)) {
            _.each(err, function (e) {
                var newArgs = [e].concat(origArgs);
                errors.logError.apply(self, newArgs);
            });
            return;
        }

        stack = err ? err.stack : null;

        if (!_.isString(err)) {
            if (_.isObject(err) && _.isString(err.message)) {
                err = err.message;
            } else {
                err = i18n.t('errors.errors.unknownErrorOccurred');
            }
        }

        //// Overwrite error to provide information that this is probably a permission problem
        //if (err.indexOf('SQLITE_READONLY') !== -1) {
        //    context = i18n.t('errors.errors.databaseIsReadOnly');
        //    help = i18n.t('errors.errors.checkDatabase');
        //}

        // TODO: Logging framework hookup
        // Eventually we'll have better logging which will know about envs
        // you can use DEBUG=true when running tests and need error stdout
        if ((process.env.NODE_LEVEL === 'DEBUG' ||
            process.env.NODE_ENV === 'development' ||
            process.env.NODE_ENV === 'staging' ||
            process.env.NODE_ENV === 'production')) {
            msgs = [chalk.red(i18n.t('errors.errors.error'), err), '\n'];

            if (context) {
                msgs.push(chalk.white(context), '\n');
            }

            if (help) {
                msgs.push(chalk.green(help));
            }

            // add a new line
            msgs.push('\n');

            if (stack) {
                msgs.push(stack, '\n');
            }

            console.error.apply(console, msgs);
        }
    },

    logErrorAndExit: function (err, context, help) {
        this.logError(err, context, help);
        // Exit with 0 to prevent npm errors as we have our own
        process.exit(0);
    },

    logAndThrowError: function (err, context, help) {
        this.logError(err, context, help);

        this.throwError(err, context, help);
    },

    logAndRejectError: function (err, context, help) {
        this.logError(err, context, help);

        return this.rejectError(err, context, help);
    },

    logErrorWithRedirect: function (msg, context, help, redirectTo, req, res) {
        /*jshint unused:false*/
        var self = this;

        return function () {
            self.logError(msg, context, help);

            if (_.isFunction(res.redirect)) {
                res.redirect(redirectTo);
            }
        };
    },

    /**
     * ### Format HTTP Errors
     * Converts the error response from the API into a format which can be returned over HTTP
     *
     * @private
     * @param {Array} error
     * @return {{errors: Array, statusCode: number}}
     */
    formatHttpErrors: function formatHttpErrors(error) {
        var statusCode = 500,
            errors = [];

        if (!_.isArray(error)) {
            error = [].concat(error);
        }

        _.each(error, function each(errorItem) {
            var errorContent = {};

            // TODO: add logic to set the correct status code
            statusCode = getStatusCode(errorItem);

            errorContent.message = _.isString(errorItem) ? errorItem :
                (_.isObject(errorItem) ? errorItem.message : i18n.t('errors.errors.unknownApiError'));
            errorContent.errorType = errorItem.errorType || 'InternalServerError';
            errors.push(errorContent);
        });

        return { errors: errors, statusCode: statusCode };
    },

    formatAndRejectAPIError: function (error, permsMessage) {
        if (!error) {
            return this.rejectError(
                new this.NoPermissionError(permsMessage || i18n.t('errors.errors.notEnoughPermission'))
            );
        }

        if (_.isString(error)) {
            return this.rejectError(new this.NoPermissionError(error));
        }

        if (error.errorType) {
            return this.rejectError(error);
        }

        // handle database errors
        if (error.code && (error.errno || error.detail)) {
            error.db_error_code = error.code;
            error.errorType = 'DatabaseError';
            error.statusCode = 500;

            return this.rejectError(error);
        }

        return this.rejectError(new this.InternalServerError(error));
    },

    handleAPIError: function errorHandler(err, req, res, next) {
        /*jshint unused:false */
        var httpErrors = this.formatHttpErrors(err);
        this.logError(err);
        // Send a properly formatted HTTP response containing the errors
        res.status(httpErrors.statusCode).json({ errors: httpErrors.errors });
    }
};

// Ensure our 'this' context for methods and preserve method arity by
// using Function#bind for expressjs
_.each([
    'logWarn',
    'logComponentInfo',
    'logComponentWarn',
    'rejectError',
    'throwError',
    'logError',
    'logAndThrowError',
    'logAndRejectError',
    'logErrorAndExit',
    'logErrorWithRedirect',
    'handleAPIError',
    'formatAndRejectAPIError',
    'formatHttpErrors'
], function (funcName) {
    errors[funcName] = errors[funcName].bind(errors);
});


module.exports = errors;
module.exports.NotFoundError = NotFoundError;
module.exports.BadRequestError = BadRequestError;
module.exports.InternalServerError = InternalServerError;
module.exports.NoPermissionError = NoPermissionError;
module.exports.UnauthorizedError = UnauthorizedError;
module.exports.ValidationError = ValidationError;
module.exports.MethodNotAllowedError = MethodNotAllowedError;

import dotenv from 'dotenv'

dotenv.config();

//===================================
// Security Utility Class
// Handles password validation logic
//===================================
class SecurityUtil {

    //===================================
    // Password Requirement Config
    // Loaded from environment vars
    //===================================
    static PASSWORD_REQUIREMENTS = {
        minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
        requireUppercase: (process.env.PASSWORD_REQUIRE_UPPERCASE || 'true') === 'true',
        requireLowercase: (process.env.PASSWORD_REQUIRE_LOWERCASE || 'true') === 'true',
        requireNumbers: (process.env.PASSWORD_REQUIRE_NUMBERS || 'true') === 'true',
        requireSymbols: (process.env.PASSWORD_REQUIRE_SYMBOLS || 'true') === 'true',
    };

    //=================================================
    // Validate Password
    // Returns: { success: boolean, errors: string[] }
    //=================================================
    static validatePassword(password) {
        const requirements = this.PASSWORD_REQUIREMENTS;
        const errors = [];

        if(!password){
            return {
                status: false,
                errors: ["Password is required"]
            }
        }

        if(password.length < requirements.minLength){
            errors.push(`Password must contain atleast ${requirements.minLength} chars`);
        }

        if (requirements.requireLowercase && !/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (requirements.requireNumbers && !/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (requirements.requireSymbols && !/[^A-Za-z0-9]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        const weakPasswords = [
            'username','password', '123456', 'qwerty', 'admin',
            'password123', '123456789'
        ];

        if (weakPasswords.includes(password.toLowerCase())) {
            errors.push('Password is too common and easily guessable');
        }

        //===================================
        // Return validation result
        //===================================
        return {
            success: errors.length === 0,
            errors,
        };
    }
}

export default SecurityUtil;
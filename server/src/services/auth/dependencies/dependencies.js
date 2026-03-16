import { AuthController } from "../controller/authController.js";
import { AuthService } from "../service/authService.js";
import MongoUserRepository from "../repository/UserRepository.js"


//============================
// Dependency Injection Setup
//============================
class DependencyContainer {

    // initialize all dependencies
    static init() {
        const repositories = {
            userRepository: MongoUserRepository,
        }

        const services = {
            authService: new AuthService(repositories.userRepository),
        }

        const controllers = {
            authController: new AuthController(services.authService),
        }

        return {
            repositories,
            services,
            controllers,
        }
    }

}

// initialize container
const initialized = DependencyContainer.init();
export {DependencyContainer};
export default initialized;
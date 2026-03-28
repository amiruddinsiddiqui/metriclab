import MongoClientRepository from "../repository/ClientRepository.js"
import MongoApiKeyRepository from "../repository/ApiKeyRepository.js"
import MongoUserRepository from "../../auth/repository/UserRepository.js"
import { ClientService } from "../services/clientService.js";
import { ClientController} from "../controller/clientController.js";
import authContainer from "../../auth/dependencies/dependencies.js"
import clientRepository from "../repository/ClientRepository.js";



class Container {
    static init() {
        const repositories = {
            clientRepository: MongoClientRepository,
            apiKeyRepository: MongoApiKeyRepository,
            userRepository: MongoUserRepository
        };

        const services = {
            clientService: new ClientService({
                clientRepository: repositories.clientRepository,
                apiKeyRepository: repositories.apiKeyRepository,
                userRepository: repositories.userRepository
            })
        }

        const controller = {
            clientController: new ClientController(services.clientService, authContainer.services.authService)
        }

        return { repositories, services, controller };
    }
}

const initialized = Container.init();
export { Container };
export default initialized;
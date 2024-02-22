import { AuthMethodsConfiguration, Configuration, DefaultApi, createConfiguration } from "organizze-sdk"
import { OraganizzeConstants } from "./constants/oraganizze";




export async function testOrganizze() {
    const { ORGANIZZE_USERNAME = '', ORGANIZZE_PASSWORD = '', ORGANIZZE_USER_AGENT = '' } = process.env
    const authConfig: AuthMethodsConfiguration = {
        "basicAuth": {
            "username": ORGANIZZE_USERNAME,
            "password": ORGANIZZE_PASSWORD
        },
        "userAgent": ORGANIZZE_USER_AGENT
    }
    
    const config: Configuration = createConfiguration({authMethods: authConfig})
    
    const api = new DefaultApi(config);
    const resp = await api.getTransactions(OraganizzeConstants.Inter.ACCOUNT_ID);
    console.log(resp);
}
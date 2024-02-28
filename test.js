const axios = require('axios');

// Функция для проверки статуса ответа
function checkStatus(response) {
    if (response.status === 200) {
        return response;
    } else {
        throw new Error(`У запроса другой ответ: ${response.status}`);
    }
}

// Функция для выполнения запроса и проверки ответа
async function performRequest(url, method, body, headers) {
    const response = await axios({
        method: method,
        url: url,
        data: body,
        headers: headers 
    }).then(checkStatus);
    return response.data;
}

// Функция для выполнения запроса CheckLogin
async function checkLogin(baseUrl, campaignId, email) {
    const url = `${baseUrl}/auth/v1/game/${campaignId}/check-login`;
    const body = { "login": email };
    const response = await performRequest(url, 'POST', body);
    const accessToken = response.accessToken; 
    return accessToken;
}

// Функция для выполнения запроса ConfirmCode
async function confirmCode(baseUrl, campaignId, accessToken, password) {
    const url = `${baseUrl}/auth/v1/game/${campaignId}/confirm-code`;
    const headers = { 'Authorization': accessToken };
    const body = { "code": password };
    await performRequest(url, 'POST', body, headers);
}

// Функция для выполнения запроса init
async function init(baseUrl, campaignId) {
    const url = `${baseUrl}/gw/v1/game/${campaignId}/init`;
    const response = await performRequest(url, 'POST', {}); 

    if ('data' in response) {
        if ('auth' in response.data) {
            console.log("Успешно");
        } else {
            console.error("Ошибка");
        }
    } 

    // Получение параметра "time" в ответе
    return response.time; // не знаю зачем нужна но пусть будет
}

async function runTests() {
    const baseUrl = 'https://api-prod.hezzl.com';
    const campaignId = '145602';
    const email = 'test@hezzl.com';
    const password = '123456';

    try {
        // Запрос init
        const Init = await init(baseUrl, campaignId);

        // Запрос CheckLogin
        const accessToken = await checkLogin(baseUrl, campaignId, email);

        // Запрос ConfirmCode
        await confirmCode(baseUrl, campaignId, accessToken, password);

        console.log('Все тесты прошли');
    } catch (error) {
        console.error('Упали потому что:', error.message);
    }
}

runTests();

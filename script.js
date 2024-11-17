document.addEventListener('DOMContentLoaded', function () {
    // Get references to various elements in the DOM
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const startOverButton = document.getElementById('start-over-button');

    // User information and tracking variables
    let userName = '';
    let currentQuestionIndex = 0;
    const answers = {}; // Stores user responses to questions

    // Load saved dark mode preference from local storage
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
        darkModeToggle.textContent = 'Light Mode';
    }

    // Toggle dark mode when the button is clicked
    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
            darkModeToggle.textContent = 'Light Mode';
        } else {
            localStorage.setItem('darkMode', 'disabled');
            darkModeToggle.textContent = 'Dark Mode';
        }
    });

    // Define the list of questions the chatbot will ask
    const questions = [
        { key: 'electricity', text: 'How much electricity do you use (kWh per month)?', type: 'number' },
        { key: 'naturalGas', text: 'How much natural gas do you use (therms per month)?', type: 'number' },
        { key: 'renewableEnergy', text: 'What percentage of your energy comes from renewable sources?', type: 'number' },
        { key: 'carType', text: 'What type of car do you use (petrol, diesel, hybrid, electric)?', type: 'text' },
        { key: 'carCommute', text: 'How many kilometers do you drive per week?', type: 'number' },
        { key: 'busCommute', text: 'How many kilometers do you commute by bus per week?', type: 'number' },
        { key: 'airTravel', text: 'How many hours do you travel by air each year?', type: 'number' },
        { key: 'diet', text: 'What is your diet type (meat, vegetarian, vegan)?', type: 'text' },
        { key: 'meatMeals', text: 'How many meat meals do you eat per week?', type: 'number' },
        { key: 'newClothing', text: 'How many new clothing items do you buy per month?', type: 'number' },
        { key: 'newElectronics', text: 'How many new electronic items do you buy per year?', type: 'number' },
        { key: 'showerDuration', text: 'How long is your average shower (minutes)?', type: 'number' },
        { key: 'efficientLights', text: 'Do you use energy-efficient light bulbs (yes/no)?', type: 'text' },
        { key: 'householdSize', text: 'How many people live in your household?', type: 'number' },
        { key: 'homeSize', text: 'What is the size of your home (square meters)?', type: 'number' },
        { key: 'waterUsage', text: 'How much water does your household use per month (liters)?', type: 'number' },
        { key: 'localFood', text: 'What percentage of your food is locally sourced?', type: 'number' },
        { key: 'publicTransport', text: 'How many kilometers do you travel by public transport per week?', type: 'number' },
        { key: 'bikeCommute', text: 'How many kilometers do you commute by bicycle per week?', type: 'number' }
    ];

    // Function to add messages to the chat window
    function addChatMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add(sender === 'bot' ? 'bot-message' : 'user-message');
        messageDiv.innerHTML = message;
        chatWindow.appendChild(messageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // Function to ask the next question in the list
    function askNextQuestion() {
        if (currentQuestionIndex < questions.length) {
            const currentQuestion = questions[currentQuestionIndex];
            setTimeout(() => addChatMessage('bot', `${getPersonalizedTransition()} ${currentQuestion.text}`), 500);
        } else {
            calculateFootprint(); // Calculate footprint once all questions are answered
        }
    }

    // Function to handle user's response
    function handleUserResponse() {
        const userResponse = userInput.value.trim();

        // Handle the initial name input
        if (!userName) {
            if (isValidName(userResponse)) {
                userName = userResponse;
                addChatMessage('user', userResponse);
                addChatMessage('bot', `Nice to meet you, ${userName}! Let's get started. 😊`);
                currentQuestionIndex = 0;
                userInput.value = '';
                askNextQuestion();
            } else {
                addChatMessage('bot', 'Please enter a valid name (letters only).');
            }
        } else if (currentQuestionIndex < questions.length) {
            const currentQuestion = questions[currentQuestionIndex];
            let parsedResponse = userResponse;

            // Validate number responses
            if (currentQuestion.type === 'number') {
                // Allow only valid non-negative numbers
                if (!/^\d+(\.\d+)?$/.test(userResponse)) {
                    addChatMessage('bot', 'Please enter a valid non-negative number (e.g., 42 or 42.5).');
                    return;
                }
                parsedResponse = parseFloat(userResponse);
            } else if (currentQuestion.type === 'text') {
                // Validate specific text responses
                parsedResponse = userResponse.toLowerCase();
                if (currentQuestion.key === 'carType' && !['petrol', 'diesel', 'hybrid', 'electric'].includes(parsedResponse)) {
                    addChatMessage('bot', 'Please enter a valid car type (petrol, diesel, hybrid, electric).');
                    return;
                }
                if (currentQuestion.key === 'diet' && !['meat', 'vegetarian', 'vegan'].includes(parsedResponse)) {
                    addChatMessage('bot', 'Please enter a valid diet type (meat, vegetarian, vegan).');
                    return;
                }
                if (currentQuestion.key === 'efficientLights' && !['yes', 'no'].includes(parsedResponse)) {
                    addChatMessage('bot', 'Please answer with yes or no.');
                    return;
                }
            }

            // Add user response to chat and store the answer
            addChatMessage('user', userResponse);
            answers[currentQuestion.key] = parsedResponse;

            // Move to the next question
            currentQuestionIndex++;
            userInput.value = '';
            askNextQuestion();
        }
    }

    // Function to calculate the user's carbon footprint
    function calculateFootprint() {
        // Factors for calculating carbon emissions
        const FACTORS = {
            electricity: 0.92,
            natural_gas: 5.3,
            petrol_car: 0.25,
            diesel_car: 0.27,
            hybrid_car: 0.15,
            electric_car: 0.05,
            bus: 0.06,
            air_travel: 250,
            diet_meat: 2.5,
            diet_vegetarian: 1.2,
            diet_vegan: 0.8,
            new_clothing: 50,
            new_electronics: 200,
            shower: 0.3,
            water_usage: 0.001,
            public_transport: 0.05,
            bike_commute: 0 // Biking has no emissions
        };

        // Calculate emissions for different categories
        const carEmissionsFactor = FACTORS[`${answers.carType}_car`] || 0;
        const dietEmissionsFactor = answers.diet === 'meat' ? FACTORS.diet_meat : (answers.diet === 'vegetarian' ? FACTORS.diet_vegetarian : FACTORS.diet_vegan);

        const electricityEmissions = (answers.electricity || 0) * FACTORS.electricity * 12 * (1 - (answers.renewableEnergy || 0) / 100);
        const naturalGasEmissions = (answers.naturalGas || 0) * FACTORS.natural_gas * 12;
        const carEmissions = (answers.carCommute || 0) * carEmissionsFactor * 52;
        const busEmissions = (answers.busCommute || 0) * FACTORS.bus * 52;
        const airTravelEmissions = (answers.airTravel || 0) * FACTORS.air_travel;
        const dietEmissions = (answers.meatMeals || 0) * dietEmissionsFactor * 52;
        const clothingEmissions = (answers.newClothing || 0) * FACTORS.new_clothing * 12;
        const electronicsEmissions = (answers.newElectronics || 0) * FACTORS.new_electronics;
        const showerEmissions = (answers.showerDuration || 0) * FACTORS.shower * 365;
        const waterEmissions = (answers.waterUsage || 0) * FACTORS.water_usage * 12;
        const publicTransportEmissions = (answers.publicTransport || 0) * FACTORS.public_transport * 52;
        const bikeEmissions = (answers.bikeCommute || 0) * FACTORS.bike_commute * 52;

        // Calculate total emissions by summing individual categories
        const totalEmissions = electricityEmissions + naturalGasEmissions + carEmissions + busEmissions +
            airTravelEmissions + dietEmissions + clothingEmissions + electronicsEmissions + showerEmissions +
            waterEmissions + publicTransportEmissions + bikeEmissions;

        // Display the breakdown of emissions and the total
        addChatMessage('bot', `Here's the breakdown of your carbon footprint, ${userName}:<br>
        - Electricity: ${electricityEmissions.toFixed(2)} kg CO2/year<br>
        - Natural Gas: ${naturalGasEmissions.toFixed(2)} kg CO2/year<br>
        - Car Travel: ${carEmissions.toFixed(2)} kg CO2/year<br>
        - Bus Travel: ${busEmissions.toFixed(2)} kg CO2/year<br>
        - Air Travel: ${airTravelEmissions.toFixed(2)} kg CO2/year<br>
        - Diet: ${dietEmissions.toFixed(2)} kg CO2/year<br>
        - Clothing: ${clothingEmissions.toFixed(2)} kg CO2/year<br>
        - Electronics: ${electronicsEmissions.toFixed(2)} kg CO2/year<br>
        - Showering: ${showerEmissions.toFixed(2)} kg CO2/year<br>
        - Water Usage: ${waterEmissions.toFixed(2)} kg CO2/year<br>
        - Public Transport: ${publicTransportEmissions.toFixed(2)} kg CO2/year<br>
        - Bike Commute: ${bikeEmissions.toFixed(2)} kg CO2/year`);

        // Display the total emissions
        addChatMessage('bot', `Your total carbon footprint is approximately ${totalEmissions.toFixed(2)} kg CO2/year, ${userName}.`);

        // Provide recommendations to reduce carbon footprint
        provideRecommendations(totalEmissions);
    }

    // Function to provide personalized recommendations based on user responses
    function provideRecommendations(totalEmissions) {
        let recommendations = `
            Here are some actionable steps to reduce your carbon footprint, ${userName}:<br>
            <ul>
        `;

        if (answers.electricity > 1000) {
            recommendations += "<li>Reduce your electricity usage by using energy-efficient appliances and turning off devices when not in use.</li>";
        }
        if (answers.naturalGas > 100) {
            recommendations += "<li>Consider insulating your home to use less natural gas for heating, or switch to renewable sources like solar.</li>";
        }
        if (answers.carCommute > 0) {
            recommendations += "<li>Try using public transportation, carpooling, or riding a bike instead of driving alone.</li>";
        }
        if (answers.airTravel > 15) {
            recommendations += "<li>Reduce air travel, or choose airlines that offer carbon offset programs.</li>";
        }
        if (answers.diet === "meat") {
            recommendations += "<li>Try reducing your meat consumption or having a vegetarian meal a few times a week to decrease emissions.</li>";
        }
        if (answers.newClothing > 3) {
            recommendations += "<li>Buy fewer new clothes, and consider purchasing second-hand items.</li>";
        }
        if (answers.newElectronics > 2) {
            recommendations += "<li>Limit your purchase of new electronics, repair old ones, or buy refurbished models.</li>";
        }
        if (answers.showerDuration > 10) {
            recommendations += "<li>Reduce your shower duration or use a water-efficient showerhead to save energy and water.</li>";
        }
        if (answers.waterUsage > 10000) {
            recommendations += "<li>Reduce water usage by fixing leaks, installing water-efficient fixtures, and using water-saving habits.</li>";
        }
        if (answers.publicTransport > 50) {
            recommendations += "<li>Consider reducing unnecessary public transport trips or opting for biking if possible.</li>";
        }

        recommendations += "</ul>";

        // Display the recommendations to the user
        addChatMessage('bot', recommendations);
    }

    // Handle the start over button to restart the conversation
    startOverButton.addEventListener('click', () => {
        chatWindow.innerHTML = '';
        currentQuestionIndex = 0;
        // Display a different welcome message if the user has already entered their name
        addChatMessage('bot', userName ? `Welcome back, ${userName}! 😊<br>Let's start another test:` : 'Hello! Welcome to EcoBuddy! 😊<br>What is your name?');
        if (userName) {
            askNextQuestion();
        }
    });

    // Event listeners for sending messages
    sendButton.addEventListener('click', handleUserResponse);
    userInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            handleUserResponse();
        }
    });

    // Initial greeting message from the chatbot
    addChatMessage('bot', 'Hello! Welcome to EcoBuddy! 😊<br> What is your name?');

    // Validate the name input to ensure it contains only letters and spaces
    function isValidName(name) {
        return /^[a-zA-Z\s]+$/.test(name);
    }

    // Function to generate personalized transition phrases between questions
    function getPersonalizedTransition() {
        const transitions = [
            `Great job, ${userName}! Here's the next one.`,
            `Thanks for that, ${userName}! Let's keep going:`,
            `You're doing awesome, ${userName}! Let's move to the next question.`,
            `Nice work, ${userName}! Here comes the next question:`
        ];
        return transitions[Math.floor(Math.random() * transitions.length)];
    }
});

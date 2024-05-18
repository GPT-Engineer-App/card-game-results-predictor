# card-game-results-predictor

<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نتائج لعبة البطاقات</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" integrity="sha384-SZXxX4whJ79/gErwcOYf+zWLeJdY/qpuqC4cAa9rOGUstPomtqpuNWT9wdPEn2fk" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f9;
            color: #333;
            direction: rtl;
        }
        h2 {
            text-align: center;
            margin: 20px 0;
            color: #4CAF50;
        }
        table.main-table, table.sub-table {
            width: 80%;
            margin: 20px auto;
            border-collapse: collapse;
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .main-table th, .main-table td, .sub-table th, .sub-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: center;
        }
        .main-table th, .sub-table th {
            background-color: #f7f7f7;
            font-weight: bold;
        }
        .main-table tr:nth-child(even), .sub-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .main-table tr:hover, .sub-table tr:hover {
            background-color: #f1f1f1;
        }
        .button-container {
            text-align: center;
            margin: 20px 0;
        }
        select, button {
            margin: 10px;
            padding: 10px 20px;
            font-size: 16px;
            border-radius: 5px;
            border: 1px solid #ccc;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.3s;
        }
        button {
            background-color: #4CAF50;
            color: #fff;
            border: none;
        }
        button:hover {
            background-color: #45a049;
            transform: scale(1.05);
        }
        select:focus {
            outline: none;
            box-shadow: 0 0 5px rgba(81, 203, 238, 1);
        }
        .trash-icon {
            cursor: pointer;
        }
        hr {
            border: none;
            height: 1px;
            background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));
            margin: 20px 0;
        }
        .tabs {
            width: 80%;
            margin: 20px auto;
            display: flex;
            justify-content: space-around;
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .tab {
            padding: 15px 20px;
            cursor: pointer;
            flex-grow: 1;
            text-align: center;
            border-bottom: 2px solid transparent;
            transition: border-color 0.3s;
        }
        .tab:hover {
            border-color: #4CAF50;
        }
        .tab.active {
            border-color: #4CAF50;
            font-weight: bold;
        }
        .tab-content {
            display: none;
            width: 80%;
            margin: 20px auto;
        }
        .tab-content.active {
            display: block;
        }
    </style>
</head>
<body>

<h2>نتائج لعبة البطاقات</h2>

<!-- Main table -->
<table class="main-table">
    <thead>
        <tr>
            <th>رقم الضربة</th>
            <th>البطاقة</th>
            <th>الخيار المختار</th>
            <th>الإجراء</th>
        </tr>
    </thead>
    <tbody id="resultsTableBody">
        <!-- Table body content will be dynamically added -->
    </tbody>
</table>

<hr>

<!-- Dropdowns and buttons -->
<div class="button-container">
    <select id="cardSelect" onchange="updatePrediction()">
        <option value="">اختر بطاقة</option>
        <!-- Options will be dynamically added using JavaScript -->
    </select>

    <select id="optionSelect">
        <option value="">اختر خيارًا</option>
        <option value="3.1">3.1</option>
        <option value="2.2">2.2</option>
        <option value="4.7">4.7</option>
        <option value="20">20</option>
    </select>

    <button onclick="addResult()"><i class="fas fa-plus"></i> إضافة نتيجة</button>
    <button onclick="saveResults()"><i class="fas fa-save"></i> حفظ النتائج</button>
    <button onclick="clearPage()"><i class="fas fa-trash-alt"></i> مسح الصفحة</button>
    <select id="shortcutSelect" onchange="jumpToCard()">
        <option value="">اختصار البطاقة</option>
        <!-- Options will be dynamically added using JavaScript -->
    </select>
</div>

<div id="predictionResult" style="text-align: center; margin-top: 20px;">
    <strong>النتيجة المتوقعة: <span id="predictedValue">لا توجد بيانات كافية للتوقع</span></strong>
</div>

<!-- Tabs for card-specific results -->
<div class="tabs">
    <div class="tab" onclick="showTab('hearts')">❤️</div>
    <div class="tab" onclick="showTab('diamonds')">♦️</div>
    <div class="tab" onclick="showTab('clubs')">♣️</div>
    <div class="tab" onclick="showTab('spades')">♠️</div>
</div>

<!-- Tab content -->
<div id="hearts" class="tab-content"></div>
<div id="diamonds" class="tab-content"></div>
<div id="clubs" class="tab-content"></div>
<div id="spades" class="tab-content"></div>

<script>
    const suits = ['❤️', '♦️', '♣️', '♠️'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    const cardSelect = document.getElementById('cardSelect');
    const shortcutSelect = document.getElementById('shortcutSelect');

    suits.forEach(suit => {
        ranks.forEach(rank => {
            const cardName = rank + suit;
            const option = document.createElement('option');
            option.text = cardName;
            option.value = cardName;
            cardSelect.add(option);

            const shortcutOption = document.createElement('option');
            shortcutOption.text = cardName;
            shortcutOption.value = cardName;
            shortcutSelect.add(shortcutOption);
        });
    });

    function createCardResultTables() {
        suits.forEach(suit => {
            ranks.forEach(rank => {
                const card = rank + suit;
                createCardResultTable(card, suit);
            });
        });
        loadResults();
    }

    window.onload = function() {
        createCardResultTables();
        loadResults();
        loadModel();
    };

    function createCardResultTable(card, suit) {
        const tabContent = document.getElementById(suit === '❤️' ? 'hearts' : suit === '♦️' ? 'diamonds' : suit === '♣️' ? 'clubs' : 'spades');
        const cardResultTable = document.createElement('table');
        cardResultTable.className = 'sub-table';
        cardResultTable.innerHTML = `
            <caption>${card} نتائج</caption>
            <thead>
                <tr>
                    <th>رقم الضربة</th>
                    <th>النتيجة</th>
                    <th>الإجراء</th>
                </tr>
            </thead>
            <tbody id="${card}CardResultTableBody">
                <!-- Table body content will be dynamically added -->
            </tbody>
        `;
        tabContent.appendChild(cardResultTable);
    }

    // TensorFlow.js model
    let model;
    let trainingData = {
        xs: [],
        ys: []
    };

    async function loadModel() {
        try {
            model = await tf.loadLayersModel('localstorage://card-game-model');
            console.log('Model loaded successfully.');
        } catch (error) {
            console.log('No pre-trained model found. Creating a new one.');
            model = createModel();
        }
    }

    function createModel() {
        const model = tf.sequential();
        model.add(tf.layers.dense({units: 16, activation: 'relu', inputShape: [1]}));
        model.add(tf.layers.dense({units: 8, activation: 'relu'}));
        model.add(tf.layers.dense({units: 1}));
        model.compile({optimizer: 'adam', loss: 'meanSquaredError'});
        return model;
    }

    function addResult() {
        const hitNumber = document.getElementById('resultsTableBody').rows.length + 1;
        const selectedCard = document.getElementById('cardSelect').value;
        const selectedOption = document.getElementById('optionSelect').value;
        if (!selectedCard || !selectedOption) {
            alert('الرجاء اختيار بطاقة واختيار خيار.');
            return;
        }

        const newRow = `
            <tr>
                <td>${hitNumber}</td>
                <td>${selectedCard}</td>
                <td>${selectedOption}</td>
                <td><span class="trash-icon" onclick="deleteResult(${hitNumber})">🗑️</span></td>
            </tr>
        `;

        document.getElementById('resultsTableBody').innerHTML += newRow;
        updateCardResults(selectedCard, hitNumber, selectedOption);
        updateTrainingData(selectedCard, selectedOption);
        trainModel();
    }

    function deleteResult(hitNumber) {
        const tableBody = document.getElementById('resultsTableBody');
        const rowToDelete = [...tableBody.rows].find(row => row.cells[0].textContent == hitNumber);
        if (!rowToDelete) {
            alert('النتيجة غير موجودة.');
            return;
        }
        tableBody.removeChild(rowToDelete);

        suits.forEach(suit => {
            ranks.forEach(rank => {
                const card = rank + suit;
                deleteCardResult(card, hitNumber);
            });
        });

        // Update training data
        trainingData.xs = [];
        trainingData.ys = [];
        [...tableBody.rows].forEach(row => {
            const card = row.cells[1].textContent;
            const option = row.cells[2].textContent;
            trainingData.xs.push(getCardValue(card));
            trainingData.ys.push(parseFloat(option));
        });
        trainModel();
    }

    function saveResults() {
        const resultsTable = document.getElementById('resultsTableBody').innerHTML;
        localStorage.setItem('savedResults', resultsTable);
        alert('تم حفظ النتائج بنجاح.');

        suits.forEach(suit => {
            ranks.forEach(rank => {
                const card = rank + suit;
                const cardResultsContainer = document.getElementById(card + 'CardResultTableBody').innerHTML;
                localStorage.setItem('savedCardResults_' + card, cardResultsContainer);
            });
        });

        // Save model
        model.save('localstorage://card-game-model');
    }

    function loadResults() {
        const savedResults = localStorage.getItem('savedResults');
        if (savedResults) {
            document.getElementById('resultsTableBody').innerHTML = savedResults;
        }
        suits.forEach(suit => {
            ranks.forEach(rank => {
                const card = rank + suit;
                const savedCardResults = localStorage.getItem('savedCardResults_' + card);
                if (savedCardResults) {
                    document.getElementById(card + 'CardResultTableBody').innerHTML = savedCardResults;
                }
            });
        });

        // Load training data
        const tableBody = document.getElementById('resultsTableBody');
        trainingData.xs = [];
        trainingData.ys = [];
        [...tableBody.rows].forEach(row => {
            const card = row.cells[1].textContent;
            const option = row.cells[2].textContent;
            trainingData.xs.push(getCardValue(card));
            trainingData.ys.push(parseFloat(option));
        });
    }

    function updateCardResults(card, hitNumber, result) {
        const cardResultTableBody = document.getElementById(card + 'CardResultTableBody');
        const newRow = `
            <tr>
                <td>${hitNumber}</td>
                <td>${result}</td>
                <td><span class="trash-icon" onclick="deleteCardResult('${card}', ${hitNumber})">🗑️</span></td>
            </tr>
        `;
        cardResultTableBody.innerHTML += newRow;
    }

    function deleteCardResult(card, hitNumber) {
        const cardResultTableBody = document.getElementById(card + 'CardResultTableBody');
        const rowToDelete = [...cardResultTableBody.rows].find(row => row.cells[0].textContent == hitNumber);
        if (!rowToDelete) {
            return;
        }
        cardResultTableBody.removeChild(rowToDelete);
    }

    function clearPage() {
        document.getElementById('resultsTableBody').innerHTML = '';
        document.getElementById('hearts').innerHTML = '';
        document.getElementById('diamonds').innerHTML = '';
        document.getElementById('clubs').innerHTML = '';
        document.getElementById('spades').innerHTML = '';
        createCardResultTables();
        localStorage.removeItem('savedResults');
        suits.forEach(suit => {
            ranks.forEach(rank => {
                const card = rank + suit;
                localStorage.removeItem('savedCardResults_' + card);
            });
        });
        trainingData = { xs: [], ys: [] };
    }

    function jumpToCard() {
        const selectedCard = document.getElementById('shortcutSelect').value;
        if (selectedCard) {
            const suit = selectedCard.slice(-2);  // للحصول على الرمز الصحيح للطاقة مثل ♥️
            const tabName = suit === '❤️' ? 'hearts' : suit === '♦️' ? 'diamonds' : suit === '♣️' ? 'clubs' : 'spades';
            showTab(tabName);
            const cardResultTable = document.getElementById(selectedCard + 'CardResultTableBody');
            if (cardResultTable) {
                cardResultTable.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
            }
        }
    }

    function showTab(tabName) {
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
        });

        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });

        document.getElementById(tabName).classList.add('active');
        document.querySelector(`.tab[onclick="showTab('${tabName}')"]`).classList.add('active');
    }

    function getCardValue(card) {
        const rank = card.slice(0, -2);
        const suit = card.slice(-2);
        return ranks.indexOf(rank) * suits.length + suits.indexOf(suit);
    }

    function updateTrainingData(card, result) {
        trainingData.xs.push(getCardValue(card));
        trainingData.ys.push(parseFloat(result));
    }

    async function trainModel() {
        if (trainingData.xs.length > 0) {
            const xs = tf.tensor2d(trainingData.xs, [trainingData.xs.length, 1]);
            const ys = tf.tensor2d(trainingData.ys, [trainingData.ys.length, 1]);
            await model.fit(xs, ys, { epochs: 100 });
        }
    }

    async function updatePrediction() {
        const selectedCard = document.getElementById('cardSelect').value;
        if (!selectedCard) {
            document.getElementById('predictedValue').textContent = 'لا توجد بيانات كافية للتوقع';
            return;
        }
        const cardValue = getCardValue(selectedCard);
        const prediction = model.predict(tf.tensor2d([cardValue], [1, 1]));
        const predictedValue = (await prediction.array())[0][0];
        document.getElementById('predictedValue').textContent = predictedValue.toFixed(2);
    }

    // Show the first tab by default
    showTab('hearts');
</script>

</body>
</html>


## Collaborate with GPT Engineer

This is a [gptengineer.app](https://gptengineer.app)-synced repository 🌟🤖

Changes made via gptengineer.app will be committed to this repo.

If you clone this repo and push changes, you will have them reflected in the GPT Engineer UI.

## Tech stack

This project is built with React and Chakra UI.

- Vite
- React
- Chakra UI

## Setup

```sh
git clone https://github.com/GPT-Engineer-App/card-game-results-predictor.git
cd card-game-results-predictor
npm i
```

```sh
npm run dev
```

This will run a dev server with auto reloading and an instant preview.

## Requirements

- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

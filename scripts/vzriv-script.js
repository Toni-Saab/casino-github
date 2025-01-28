document.addEventListener('DOMContentLoaded', function() {
    const gridItems = document.querySelectorAll('.grid-item');
    const startButton = document.querySelector('.start-button');
    const gridContainer = document.querySelector('.grid-container');
    const endRoundMessage = document.querySelector('.end-round-message');
    let freeSpins, balance, attemptsLeft, results = [];

    function updateGame() {
        window.parent.postMessage({ freeSpins: freeSpins, balance: balance }, '*');
    }

    function startGame() {
        if (freeSpins > 0) {
            freeSpins--;
            attemptsLeft = 3;
            generateResults();
            startButton.style.display = 'none';
            gridContainer.style.display = 'grid';
            endRoundMessage.style.display = 'none';

            gridItems.forEach(function(item) {
                item.classList.remove('flip');
                item.querySelector('.grid-item__back').innerHTML = '';
                item.style.opacity = '1';
            });
        } else {
            alert('У вас нет доступных фриспинов!');
        }
        updateGame();
    }

    function generateResults() {
        results = Array(9).fill(null);
        const allIndices = Array.from({ length: 9 }, (_, i) => i);
        const freeSpinIndices = getRandomUniqueIndices(allIndices, 3);
        const negativeIndices = getRandomUniqueIndices(allIndices, 3);
        const positiveIndices = getRandomUniqueIndices(allIndices, 2);

        freeSpinIndices.forEach(function(index) {
            results[index] = '<span style="color: gold;">+1 Фриспин</span>';
        });

        negativeIndices.forEach(function(index) {
            results[index] = '<span style="color: red;">' + getRandomInt(-50, -10) + '</span>';
        });

        positiveIndices.forEach(function(index) {
            results[index] = '<span style="color: green;">' + getRandomInt(10, 50) + '</span>';
        });

        const remainingIndex = allIndices[0];
        results[remainingIndex] = '<span style="color: #fff;">Пусто</span>';
    }

    function getRandomUniqueIndices(allIndices, count) {
        const indices = [];
        while (indices.length < count) {
            const randomIndex = Math.floor(Math.random() * allIndices.length);
            indices.push(allIndices.splice(randomIndex, 1)[0]);
        }
        return indices;
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function handleItemClick(event) {
        if (attemptsLeft > 0) {
            const item = event.currentTarget;
            const index = item.dataset.index;

            if (!item.classList.contains('flip')) {
                item.classList.add('flip');
                item.querySelector('.grid-item__back').innerHTML = results[index];

                adjustFontSize();

                if (results[index].includes('Фриспин')) {
                    freeSpins++;
                } else if (results[index].includes('Пусто')) {
                    
                } else {
                    balance += parseInt(item.querySelector('.grid-item__back').textContent);
                }

                attemptsLeft--;
                updateGame();

                if (attemptsLeft === 0) {
                    endRoundSequence();
                }
            }
        }
    }

    function adjustFontSize() {
        const spans = document.querySelectorAll('.grid-item__back span');
        const screenWidth = window.innerWidth;
    
        const fontSizeMap = {
            3200: '8rem',
            2560: '6rem',
            1920: '4rem',
            1600: '3rem',
            1280: '2.5rem',
            1024: '2rem',
            800: '1.8rem',
            640: '1.6rem',
            390: '1.4rem'
        };
    
        let selectedFontSize = '1.2rem';
    
        for (const [width, fontSize] of Object.entries(fontSizeMap)) {
            if (screenWidth <= width) {
                selectedFontSize = fontSize;
                break;
            }
        }
    
        spans.forEach(span => {
            span.style.fontSize = selectedFontSize;
        });
    }
    
    

    function endRoundSequence() {
        setTimeout(function() {
            gridItems.forEach(function(item) {
                item.style.opacity = '0';
            });

            setTimeout(function() {
                gridContainer.style.display = 'none';
                endRoundMessage.style.display = 'block';

                setTimeout(function() {
                    endRoundMessage.style.opacity = '0';

                    setTimeout(function() {
                        endRoundMessage.style.display = 'none';
                        endRoundMessage.style.opacity = '1';
                        startButton.style.display = 'block';
                    }, 1000);

                }, 2000);

            }, 1000);

        }, 1000);
    }

    startButton.addEventListener('click', startGame);

    gridItems.forEach(function(item) {
        item.addEventListener('click', handleItemClick);
    });

    window.addEventListener('message', function(event) {
        const data = event.data;

        if (data.balance !== undefined) {
            balance = data.balance;
        }

        if (data.freeSpins !== undefined) {
            freeSpins = data.freeSpins;
        }
    });

    window.parent.postMessage({ requestInitialData: true }, '*');
    window.addEventListener('resize', adjustFontSize);
    adjustFontSize();
});

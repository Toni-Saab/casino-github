document.addEventListener("DOMContentLoaded", function() {
    const gameLinks = document.querySelectorAll(".game-link");
    const adContainer = document.querySelector(".ad-container");
    const commentsContainer = document.querySelector(".comments");
    const originalCommentsHTML = commentsContainer.innerHTML;
    const adImages = ["media/ads/ad1.png", "media/ads/ad2.png", "media/ads/ad3.webp"];
    let adIndex = 0;
    let adInterval;
    let activeLink = null;

    function updateAd() {
        adIndex = (adIndex + 1) % adImages.length;
        adContainer.style.backgroundImage = "url('" + adImages[adIndex] + "')";
    }

    function startAdRotation() {
        updateAd();
        adInterval = setInterval(updateAd, 5000);
    }

    function stopAdRotation() {
        clearInterval(adInterval);
    }

    function resetButtonStyles(link, iconSrc) {
        link.style.backgroundColor = "var(--button-active)";
        link.style.borderColor = "var(--highlight-red)";
        link.querySelector(".game-icon").src = iconSrc;
        document.querySelectorAll(".game-name").forEach(function(gameName) {
            gameName.style.display = "block";
        });
    }

    function applyActiveStyles(clickedLink, closeIconSrc) {
        gameLinks.forEach(function(link) {
            const icon = link.querySelector(".game-icon");
            if (link === clickedLink) {
                link.style.backgroundColor = "blue";
                link.style.borderColor = "lightblue";
                icon.src = closeIconSrc;
            } else if (link.classList.contains("active")) {
                resetButtonStyles(link, icon.src);
            } else if (link.classList.contains("inactive")) {
                link.style.backgroundColor = "var(--button-gray)";
                link.style.borderColor = "#000";
                link.style.color = "#969696";
            }
        });

        document.querySelectorAll(".game-name").forEach(function(gameName) {
            gameName.style.display = "none";
        });
    }

    function toggleMenu(link, iconSrc, isCollapsing) {
        document.querySelector(".main").classList.toggle("collapsed", isCollapsing);
        adContainer.style.display = isCollapsing ? "block" : "none";

        if (isCollapsing) {
            startAdRotation();
            applyActiveStyles(link, iconSrc);
        } else {
            stopAdRotation();
            resetButtonStyles(link, iconSrc);
        }
    }

    function loadGame(link) {
        const gameSrc = link.dataset.gameSrc;
        const iframe = document.createElement("iframe");
        iframe.src = gameSrc;
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";

        commentsContainer.innerHTML = "";
        commentsContainer.appendChild(iframe);

        iframe.onload = function() {
            const balance = parseInt(document.querySelector('.player-stats__balance-value').textContent);
            const freeSpins = parseInt(document.querySelector('.player-stats__freespins-value').textContent);

            iframe.contentWindow.postMessage({ balance: balance, freeSpins: freeSpins }, '*');
        };
    }

    function unloadGame() {
        commentsContainer.innerHTML = originalCommentsHTML;
    }

    gameLinks.forEach(function(link) {
        const isActive = link.classList.contains("active");
        const icon = link.querySelector(".game-icon");
        const originalIconSrc = icon ? icon.src : "";
        const closeIconSrc = "media/game-icons/close.svg";

        link.addEventListener("click", function(event) {
            event.preventDefault();

            if (!isActive) {
                return;
            }

            const isCollapsed = document.querySelector(".main").classList.contains("collapsed");

            if (isCollapsed && link === activeLink) {
                toggleMenu(link, originalIconSrc, false);
                unloadGame();
                activeLink = null;
            } else if (!isCollapsed) {
                toggleMenu(link, closeIconSrc, true);
                loadGame(link);
                activeLink = link;
            }
        });
    });

    window.addEventListener('message', function(event) {
        const data = event.data;

        if (data.balance !== undefined) {
            document.querySelector('.player-stats__balance-value').textContent = data.balance + '$';
        }

        if (data.freeSpins !== undefined) {
            document.querySelector('.player-stats__freespins-value').textContent = data.freeSpins;
        }
    });
});

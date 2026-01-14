// Initialize Constants Global Variables
const svgNS = "http://www.w3.org/2000/svg";

// Id Handler will manage Id for each item i want
class IdHandler {
    constructor () {
        this.deckid = 0;
        this.cardid = 0;
        this.playerid = 0;
        this.unknownid = 0;

        this.deckcount = 0;
        this.cardcount = 0;
        this.playercount = 0;
        this.unknowncount = 0;
    }
    idHandler (type) {
        let id;
        if (type == "card") {
            id = this.cardid;
            this.cardid++;
        }
        else if (type == "deck") {
            id  = this.deckid;
            this.deckid++;
        }
        else if (type == "player") {
            id  = this.playerid;
            this.playerid++;
        }
        else {
            id  = this.unknownid;
            this.unknownid++;
        }
        return type+"_"+id.toString().padStart(3, "0");
    }
    report () {
        console.log(
            "Card count: "+(this.cardcount)+"\n"+
            "Deck count: "+(this.deckcount)+"\n"+
            "Player count: "+(this.playercount)+"\n"+
            "Unkown count: "+(this.unknowncount)+"\n"
        );
    }
}

// Card config will set the size and shape of the card svg
class CardConfig {
    constructor(scale = 30) {
        const s = String; // refrecene to the String() class

        this.scale = s(scale);

        this.offset = {
            symbolX: String(scale * 0.33),
            symbolY: String(scale * 0.83),
            suitX:   String(scale * 0.33),
            suitY:   String(scale * 1.5)
        };

        this.dim = {
            width:     s(scale * 5),
            height:    s(scale * 7),
            curve:     s(scale * 0.5),
            borderWidth: s(scale * 0.07)
        };

        this.symbol = {
            font: "Arial, sans-serif",
            fontSize:   s(scale * 2 / 3),
            centerSize: s(scale * 5 / 3)
        };

        this.colors = {
            background:  "white",
            border:      "black",
            color:   "black",
            colorAlt:     "red",
            colorOther:   "blue",
            backSymbol:  "orange"
        };

        this.origin = {
            x: s(0),
            y: s(0)
        };

        this.center = {
            x: String(Number(this.origin.x) + Number(this.dim.width) / 2),
            y: String(Number(this.origin.y) + Number(this.dim.height) / 2)
        };

    }
}

// Initialize Other Constants Global Variables
const idManager = new IdHandler();
const cardStyle = new CardConfig();

class CardSVG {
    constructor(suit, symbol, id) {
        this.Suit = suit;
        this.Symbol = symbol;
        this.id = id;

        this.cardFront = document.createElementNS(svgNS, "svg");
        this.cardBack  = document.createElementNS(svgNS, "svg");

        this.display = null;
        this.currentDisplay = false;
        this.flipable = false;       


        if (suit === '♥' || suit === '♦') {
            this.color = cardStyle.colors.colorAlt;
        } else if (suit === '♣' || suit === '♠') {
            this.color = cardStyle.colors.color;
        } else {
            this.color = cardStyle.colors.colorOther;
        }

        this.createCardBack();
        this.createCardFront();
        this.setDisplay();
    }

    setDisplay (type = false) {
        if (type) {
            this.display = this.cardFront;
            this.display.classList.add("col-auto");
            this.display.setAttribute("width", cardStyle.dim.width);
            this.display.setAttribute("height", cardStyle.dim.height);
            this.display.id = this.id;
        }
        else {
            this.display = this.cardBack;
            this.display.classList.add("col-auto");
            this.display.setAttribute("width", cardStyle.dim.width);
            this.display.setAttribute("height", cardStyle.dim.height);
            this.display.id = this.id;
        }
        this.currentDisplay = type;
        //console.log("Display: Type = "+type+" | currentDisplay = "+this.currentDisplay)
    }

    getFront () {
        return this.cardFront;
    }

    getBack () {
        return this.cardBack;
    }

    setFlipable() {
        this.flipable = true;
        if (this.display) {
            this.display.addEventListener("click", () => this.playerFlip(), { once: true });
        }
    }

    playerFlip() {
        if (this.flipable == false || this.currentDisplay == true) {
            return;
        }
        this.flipable = false;
        this.flipAnimation(() => this.setDisplay(true));
    }

    dealerFlip() {
        if (this.currentDisplay == false) {
            this.flipAnimation(() => this.setDisplay(true));
        }
    }

    flipAnimation(swapFace) {
        const currentElement = this.display;
        if (!currentElement) return;

        let progress = 0;
        const step = 0.05;

        const parent = currentElement.parentNode;

        const timer = setInterval(() => {
            progress += step;

            if (progress < 0.5) {
                const scaleX = 1 - progress * 2;
                currentElement.setAttribute("transform", `scale(${scaleX},1)`);
            } 
            else if (progress >= 0.5 && progress < 0.5 + step) {
                // ---- swap to front face by calling the function in thin function ----
                if (swapFace) {
                    swapFace();
                }
                // replace old with new display in DOM
                if (parent) {
                    parent.replaceChild(this.display, currentElement);
                }
            } 
            else {
                const scaleX = (progress - 0.5) * 2;
                this.display.setAttribute("transform", `scale(${scaleX},1)`);
            }

            if (progress >= 1) {
                this.display.removeAttribute("transform");
                clearInterval(timer);
            }
        }, 16);
    }




    createCardBack() {
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", cardStyle.dim.width);
        svg.setAttribute("height", cardStyle.dim.height);

        const rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("x", cardStyle.origin.x);
        rect.setAttribute("y", cardStyle.origin.y);
        rect.setAttribute("width", cardStyle.dim.width);
        rect.setAttribute("height", cardStyle.dim.height);
        rect.setAttribute("rx", cardStyle.dim.curve);
        rect.setAttribute("ry", cardStyle.dim.curve);
        rect.setAttribute("fill", cardStyle.colors.background);
        rect.setAttribute("stroke", cardStyle.colors.border);
        rect.setAttribute("stroke-width", cardStyle.dim.borderWidth);
        svg.appendChild(rect);

        // Card Art
        const centerSuit = document.createElementNS(svgNS, "text");
        centerSuit.setAttribute("x", cardStyle.center.x);
        centerSuit.setAttribute("y", cardStyle.center.y);
        centerSuit.setAttribute("font-size", cardStyle.symbol.centerSize);
        centerSuit.setAttribute("font-family", cardStyle.symbol.font);
        centerSuit.setAttribute("fill", cardStyle.colors.backSymbol);
        centerSuit.setAttribute("text-anchor", "middle");
        centerSuit.setAttribute("dominant-baseline", "middle");
        centerSuit.textContent = "⚄";
        svg.appendChild(centerSuit);

        this.cardBack = svg;
    }

    createCardFront() {
        const svg = this.cardFront;
        svg.setAttribute("width", cardStyle.dim.width);
        svg.setAttribute("height", cardStyle.dim.height);

        // Background
        const rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("x", cardStyle.origin.x);
        rect.setAttribute("y", cardStyle.origin.y);
        rect.setAttribute("width", cardStyle.dim.width);
        rect.setAttribute("height", cardStyle.dim.height);
        rect.setAttribute("rx", cardStyle.dim.curve);
        rect.setAttribute("ry", cardStyle.dim.curve);
        rect.setAttribute("fill", cardStyle.colors.background);
        rect.setAttribute("stroke", cardStyle.colors.border);
        rect.setAttribute("stroke-width", cardStyle.dim.borderWidth);
        svg.appendChild(rect);

        // Top group
        const topGroup = document.createElementNS(svgNS, "g");

        const topSymbol = document.createElementNS(svgNS, "text");
        topSymbol.setAttribute("x", cardStyle.offset.symbolX);
        topSymbol.setAttribute("y", cardStyle.offset.symbolY);
        topSymbol.setAttribute("font-size", cardStyle.symbol.fontSize);
        topSymbol.setAttribute("font-family", cardStyle.symbol.font);
        topSymbol.setAttribute("fill", this.color);
        topSymbol.textContent = this.Symbol;
        topGroup.appendChild(topSymbol);

        const topSuit = document.createElementNS(svgNS, "text");
        topSuit.setAttribute("x", cardStyle.offset.suitX);
        topSuit.setAttribute("y", cardStyle.offset.suitY);
        topSuit.setAttribute("font-size", cardStyle.symbol.fontSize);
        topSuit.setAttribute("font-family", cardStyle.symbol.font);
        topSuit.setAttribute("fill", this.color);
        topSuit.textContent = this.Suit;
        topGroup.appendChild(topSuit);
        svg.appendChild(topGroup);

        // Bottom group
        const bottomGroup = document.createElementNS(svgNS, "g");
        bottomGroup.setAttribute("transform", "rotate(180, "+cardStyle.center.x+", "+cardStyle.center.y+")");

        const bottomSymbol = document.createElementNS(svgNS, "text");
        bottomSymbol.setAttribute("x", cardStyle.offset.symbolX);
        bottomSymbol.setAttribute("y", cardStyle.offset.symbolY);
        bottomSymbol.setAttribute("font-size", cardStyle.symbol.fontSize);
        bottomSymbol.setAttribute("font-family", cardStyle.symbol.font);
        bottomSymbol.setAttribute("fill", this.color);
        bottomSymbol.textContent = this.Symbol;
        bottomGroup.appendChild(bottomSymbol);

        const bottomSuit = document.createElementNS(svgNS, "text");
        bottomSuit.setAttribute("x", cardStyle.offset.suitX);
        bottomSuit.setAttribute("y", cardStyle.offset.suitY);
        bottomSuit.setAttribute("font-size", cardStyle.symbol.fontSize);
        bottomSuit.setAttribute("font-family", cardStyle.symbol.font);
        bottomSuit.setAttribute("fill", this.color);
        bottomSuit.textContent = this.Suit;
        bottomGroup.appendChild(bottomSuit);
        svg.appendChild(bottomGroup);

        // Center suit
        const centerSuit = document.createElementNS(svgNS, "text");
        centerSuit.setAttribute("x", cardStyle.center.x);
        centerSuit.setAttribute("y", cardStyle.center.y);
        centerSuit.setAttribute("font-size", cardStyle.symbol.centerSize);
        centerSuit.setAttribute("font-family", cardStyle.symbol.font);
        centerSuit.setAttribute("fill", this.color);
        centerSuit.setAttribute("text-anchor", "middle");
        centerSuit.setAttribute("dominant-baseline", "middle");
        centerSuit.textContent = this.Suit;
        svg.appendChild(centerSuit);

        this.cardFront = svg;
    }
}

class Card {
    constructor (suit, symbol, type = "card") {
        this.id = idManager.idHandler(type);
        this.suit = suit;
        this.symbol = symbol;
        this.svgCard = new CardSVG( suit, symbol, this.id);
    }
}

class Card21 extends Card {
    constructor (suit, symbol, type = "card") {
        super(suit, symbol, type = "card");
        
        if ( symbol == 'A' ){
            this.value    = 11;
        }
        else if ( symbol == 'J' || symbol == 'Q' || symbol == 'K' ){
            this.value    = 10;
        } 
        else if ( isNaN(symbol) == false && symbol != 0){
            this.value    = parseInt(symbol);
        }
        else {
            this.value    = -1;
            console.log("Card21: suit = "+suit+" | symbol = "+symbol+" | type = "+type)
        }
    }
    getValue() {
        return this.value;
    }
}

class Deck {
    constructor (type = "deck") {
        // Collection of Cards
        this.collection = [];
        this.id         = idManager.idHandler(type);
        this.deckSVG    = null;
        if (type == "deck") {
            this.defaultInitialization();
        }
    }

    defaultInitialization () {
        const suits = ['♥', '♦', '♣', '♠'];
        const symbols = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        for (let suit of suits){
            for (let symbol of symbols){
                this.collection.push(new Card21(suit, symbol));
            }
        }
    }

    drawCard() {
        if (this.collection.length == 0) {
            console.log("Deck is empty!");
            return null;
        }
        else {
            return this.collection.pop();
        }
    }

    shuffleCards() {
        for (let i = this.collection.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));

            let temp = this.collection[i];
            this.collection[i] = this.collection[j];
            this.collection[j] = temp;
        }
    }
}

class DeckPile {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.deck = new Deck();       // Uses the existing Deck class
        this.svg = null;
        this.renderPile();
    }

    /*----[Render pile normally without scaling]----*/
    renderPile() {
        this.container.innerHTML = "";

        this.svg = document.createElementNS(svgNS, "svg");
        this.svg.setAttribute("width", "150");
        this.svg.setAttribute("height", "200");

        const pile = document.createElementNS(svgNS, "g");

        this.deck.collection.forEach((card, i) => {
            const backSvg = card.svgCard.getBack();
            const wrapper = document.createElementNS(svgNS, "g");

            // Just stack slightly offset
            const offsetX = i * 0.2;
            const offsetY = -i * 0.4;
            wrapper.setAttribute("transform", `translate(${offsetX}, ${offsetY})`);
            wrapper.appendChild(backSvg);

            pile.appendChild(wrapper);
        });

        this.svg.appendChild(pile);
        this.container.appendChild(this.svg);
    }

    /*----[Remove top card with fly-out animation]----*/
    removeCard() {
        if (this.deck.collection.length === 0) {
            console.log("Pile is empty");
            return;
        }

        // Get the last card element in the SVG
        const pileGroup = this.svg.querySelector("g");  
        const oldDeck = pileGroup.lastElementChild; 

        if (!oldDeck) {
            return;
        }
        // Animate: move the card to the right and fade it out
        oldDeck.style.transition = "transform 0.5s ease, opacity 0.5s ease";
        oldDeck.style.opacity = "1";

        // Force reflow so the browser registers the initial state
        void oldDeck.offsetWidth;

        // Apply transformation for fly-out
        oldDeck.style.transform = "translate(150px, -50px)";
        oldDeck.style.opacity = "0";

        // After animation ends → actually remove card from DOM and deck
        setTimeout(() => {
            oldDeck.remove();
            this.deck.collection.pop(); // remove card from collection
            this.renderPile();          // re-render the pile
        }, 500); // matches transition duration
    }

}


class Player extends Deck {
    constructor () {
        super("player");
        this.handValue = 0;
        this.cardCount = 0;
        this.aceCount = 0;

    }
    hit(deck) {
        // Only allow 5 playable cards (6th is for animation buffer)
        if (this.cardCount >= 5) {
            console.log("Player already has 5 cards. 6th slot reserved for animation.");
            return null;
        }

        const card = deck.drawCard(); // only draw AFTER we pass the check

        if (!card) {
            console.log("Deck is empty or draw failed.");
            return null;
        }

        const value = card.getValue();

        if (value !== -1) {
            this.handValue += value;
            this.cardCount++;

            if (card.symbol === 'A') {
                this.aceCount++;
            }

            while (this.handValue > 21 && this.aceCount > 0) {
                this.handValue -= 10;
                this.aceCount--;
            }
        }

        card.svgCard.setDisplay(true);
        this.collection.push(card);
        return card;
    }
}

class DeckAnimation {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.deck = new Deck();          // Use the existing Deck class
        this.cardInterval = null;        
        this.cards = [];                 
        this.angle = 0;                  
        this.scale = 0.3;                // <--- shrink factor

        this.setupCards();
    }

    /*----[Create and place cards in a horizontal line]----*/
    setupCards() {
        this.container.innerHTML = "";
        this.cards = [];

        // SVG wrapper
        this.cardCollection = document.createElementNS(svgNS, "svg");
        this.cardCollection.setAttribute("width", "90%");
        this.cardCollection.setAttribute("height", "200");

        const scale = 0.5; // shrink cards to 50%

        this.deck.collection.forEach((card, i) => {
            // Wrap the original back SVG inside a group and apply scale
            const backSvg = card.svgCard.getBack();
            const group = document.createElementNS(svgNS, "g");
            group.appendChild(backSvg);

            // Apply both scaling and positioning
            group.setAttribute(
                "transform",
                `translate(${i * (30 * scale)}, 50) scale(${scale})`
            );

            this.cardCollection.appendChild(group);
            this.cards.push(group);
        });

        this.container.appendChild(this.cardCollection);
    }

    /*----[Start the wave animation]----*/
    startWave() {
        if (this.cardInterval) return;
        this.angle = 0;

        this.cardInterval = setInterval(() => {
            this.angle += 0.1;
            this.cards.forEach((card, i) => {
                const y = 50 + Math.sin(this.angle + i * 0.4) * 10;
                card.setAttribute("transform", `translate(${i * 20.5}, ${y}) scale(${this.scale})`);
            });
        }, 13);
    }

    /*----[Stop the animation]----*/
    stopWave() {
        if (this.cardInterval) {
            clearInterval(this.cardInterval);
            this.cardInterval = null;
        }
    }

    /*----[Remove one card from the animation]----*/
    removeCard() {
        if (this.cards.length > 0) {
            const removed = this.cards.pop();
            removed.remove();
        }
        if (this.cards.length == 0) {
            this.stopWave();
        }
    }
}




class Game {
    constructor() {
        this.deck = new Deck();
        this.player = new Player();
        this.dealer = new Player();

        this.domHandler = new DomHandler();
        this.deckPile = new DeckPile("deck_cards");
        this.waveAni = new DeckAnimation("deck_visual");
        this.animHandler = new AnimationHandler(this.waveAni, this.deckPile);

        this.animHandler.startWave();

        this.checkScore = null;
    }

    /*----[ Start Game Phase ]----*/
   startGame() {
        this.deck.shuffleCards();
        this.domHandler.updateStatus("Dealing Cards...");

       
        const dealOrder = [
            { who: "player", faceUp: true, flipable: false },
            { who: "player", faceUp: false, flipable: true },
            { who: "dealer", faceUp: true, flipable: false },
            { who: "dealer", faceUp: false, flipable: false }
        ];

        for (let i = 0; i < dealOrder.length; i++) {
            setTimeout(() => {
                let step = dealOrder[i];
                let card;
                this.startCheckScore()

                // Draw card based on who is receiving it
                if (step.who == "player") {
                    this.deckPile.removeCard()
                    card = this.player.hit(this.deck);
                }
                else {
                    this.deckPile.removeCard()
                    card = this.dealer.hit(this.deck);
                }

                if (!card) {
                    console.log("Failed to draw a card");
                    return;
                }

                // Set face up or down
                card.svgCard.setDisplay(step.faceUp);

                // Make it flipable only if needed
                if (step.flipable == true) {
                    card.svgCard.setFlipable();
                }
                // Animate the dealing
                if (step.who == "player") {
                    this.animHandler.dealCard(card, this.domHandler.playerHand);
                }
                else {
                    this.animHandler.dealCard(card, this.domHandler.dealerHand);

                }
                // After the last card, start the player phase 
                if (i == dealOrder.length - 1) {
                    setTimeout(() => {
                        this.domHandler.updateStatus("Player Turn");
                        this.playerTurn();
                    }, 800);
                }
            }, i * 800); 
        }
    }

    /*----[ Player Phase ]----*/
    playerTurn() {
        this.domHandler.updateStatus("Your Turn! Hit or Stand?");
        this.domHandler.setButtons(false); // Enable buttons

        // --- Countdown timer (52 sec) ---
        let time = 52;
        if (this.playerTimer) {
            clearInterval(this.playerTimer);
        }
        this.playerTimer = setInterval(() => {
            this.waveAni.removeCard(); // remove 1 card from pile each second
            time--;

            if (time <= 0) {
                clearInterval(this.playerTimer);
                this.domHandler.updateStatus("Time's up! Auto Stand.");
                this.domHandler.setButtons(true); // Disable buttons
                this.revealPhase(); // move to reveal
            }
        }, 1000);

        // --- Hit Button Event ---
        this.domHandler.hitBtn.onclick = () => {
            this.deckPile.removeCard(); // remove a card from pile when hitting
            const card = this.player.hit(this.deck);

            if (card) {
                this.animHandler.dealCard(card, this.domHandler.playerHand);
                this.updateScoreDisplay();
            }

            // If player busts
            if (this.player.handValue > 21) {
                clearInterval(this.playerTimer);
                this.domHandler.updateStatus("Player Busts!");
                this.domHandler.setButtons(true);
                this.results("playerBust");
            }
        };

        // --- Stand Button Event ---
        this.domHandler.standBtn.onclick = () => {
            clearInterval(this.playerTimer);
            this.domHandler.updateStatus("Player Stands");
            this.domHandler.setButtons(true);
            this.revealPhase(); // Go to next phase
        };
    }


    /*----[ Reveal Phase ]----*/
    revealPhase() {
        this.domHandler.updateStatus("Revealing Cards...");
        this.domHandler.setButtons(true); // Disable buttons

        // --- Flip Player's face-down cards ---
        this.player.collection.forEach(card => {
            if (card.svgCard.currentDisplay === false) {
                card.svgCard.dealerFlip();
            }
        });

        // --- Flip Dealer's face-down cards ---
        this.dealer.collection.forEach(card => {
            if (card.svgCard.currentDisplay === false) {
                card.svgCard.dealerFlip();
            }
        });

        // Allow flip animations to complete before scoring
        setTimeout(() => {
            if (this.player.handValue > 21) {
                this.results("playerBust");
            } 
            else if (this.player.handValue > this.dealer.handValue) {
                this.domHandler.updateStatus("Player is ahead, Dealer's turn...");
                setTimeout(() => this.dealerTurn(), 800);
            } 
            else if (this.player.handValue === this.dealer.handValue) {
                this.results("tie");
            } 
            else {
                this.results("dealerWin");
            }
        }, 800);
    }


    /*----[ Dealer Phase ]----*/
    dealerTurn() {
        this.domHandler.updateStatus("Dealer's Turn...");
        this.domHandler.setButtons(true); // disable player controls

        let drawIndex = 0;

        const drawStep = () => {
            let dealerScore = this.dealer.handValue;
            let playerScore = this.player.handValue;

            // --- Stop conditions ---
            if (dealerScore > 21) {
                this.results("dealerBust");
                return;
            }
            if (dealerScore > playerScore || dealerScore == playerScore || this.dealer.cardCount >= 5) {
                this.results("compare");
                return;
            }

            // --- Draw next card ---
            const card = this.dealer.hit(this.deck);
            if (!card) {
                this.results("compare");
                return;
            }

            // Animate the card being dealt
            card.svgCard.setDisplay(true);
            this.animHandler.dealCard(card, this.domHandler.dealerHand);

            drawIndex++;
            setTimeout(drawStep, 1200); // wait before next card
        };

        // Start dealer drawing process
        setTimeout(drawStep, 1000);
    }



    /*----[ Results Phase ]----*/
    results(reason = "compare") {
        this.stopCheckScore();
        this.domHandler.setButtons(true); // disable controls
        this.domHandler.updateStatus("Revealing results...");

        // Delay to allow reveal animations
        setTimeout(() => {
            let playerScore = this.player.handValue;
            let dealerScore = this.dealer.handValue;

            let message = "";

            if (reason == "playerBust") {
                message = "Player Busts! Dealer Wins!";
            } else if (reason == "dealerBust") {
                message = "Dealer Busts! Player Wins!";
            } else if (playerScore > dealerScore && playerScore <= 21) {
                message = "Player Wins!";
            } else if (dealerScore > playerScore && dealerScore <= 21) {
                message = "Dealer Wins!";
            } else {
                message = "It's a Tie!";
            }

            // Update status and final scores
            this.domHandler.updateStatus(message);
            this.updateScoreDisplay();
        }, 1200);
    }



    resetGame() {
        // 1. Stop score watcher
        this.stopCheckScore();

        // 2. Clear UI elements
        this.domHandler.clearBoard();
        this.domHandler.updateScore("0", "0");
        this.domHandler.updateStatus("Game Reset");

        // 3. Reset players
        this.player = new Player();
        this.dealer = new Player();

        // 4. Reset deck
        this.deck = new Deck();
        this.deck.shuffleCards();

        // 5. Reset deck pile and animation
        this.deckPile = new DeckPile("deck_cards");
        this.waveAni = new DeckAnimation("deck_visual");
        this.animHandler = new AnimationHandler(this.waveAni, this.deckPile);

        // 6. Restart wave animation
        this.animHandler.startWave();
    }


   updateScoreDisplay() {
        // --- Player Visible Score ---
        let playerScore = 0;
        let playerAces = 0;
        let playerHidden = false;

        for (let i = 0; i < this.player.collection.length; i++) {
            let card = this.player.collection[i];

            if (card.svgCard.currentDisplay === true) {
                playerScore += card.getValue();

                if (card.symbol === 'A') {
                    playerAces++;
                }
            } 
            else {
                playerHidden = true;
            }
        }

        while (playerScore > 21 && playerAces > 0) {
            playerScore -= 10;
            playerAces--;
        }

        let pText;
        if (playerHidden === true) {
            pText = playerScore + " + ?";
        } 
        else {
            pText = playerScore.toString();
        }

        // --- Dealer Visible Score ---
        let dealerScore = 0;
        let dealerAces = 0;
        let dealerHidden = false;

        for (let i = 0; i < this.dealer.collection.length; i++) {
            let card = this.dealer.collection[i];

            if (card.svgCard.currentDisplay === true) {
                dealerScore += card.getValue();

                if (card.symbol === 'A') {
                    dealerAces++;
                }
            } 
            else {
                dealerHidden = true;
            }
        }

        while (dealerScore > 21 && dealerAces > 0) {
            dealerScore -= 10;
            dealerAces--;
        }

        let dText;
        if (dealerHidden === true) {
            dText = dealerScore + " + ?";
        } 
        else {
            dText = dealerScore.toString();
        }

        // --- Update UI ---
        this.domHandler.updateScore(pText, dText);
    }

    startCheckScore() {
        if (this.checkScore) return;
        this.checkScore = setInterval(() => {
            this.updateScoreDisplay();
        }, 200);
    }

    stopCheckScore() {
        clearInterval(this.checkScore);
        this.checkScore = null;
    }
}





//----[Setup Start Button to Initialize Game]----
const startBtn = document.getElementById("start_game_btn");
const startSection = document.getElementById("start_section");
const gameSection = document.getElementById("game_section");

let game = null;

gameSection.hidden = true;

startBtn.addEventListener("click", () => {
    startSection.remove();         // Remove start button section
    gameSection.hidden = false;    // Show game area
    game = new Game();             // Initialize Game
    game.startGame();
});


document.getElementById("restartBtn").onclick = () => {
    game.resetGame();
    game.startGame();
};



class DomHandler {
    constructor() {
        this.playerHand = document.getElementById("player_hand");
        this.dealerHand = document.getElementById("dealer_hand");
        this.playerValueBox = document.getElementById("player_value_box");
        this.dealerValueBox = document.getElementById("dealer_value_box");
        this.statusBox = document.getElementById("status");
        this.hitBtn = document.getElementById("hitBtn");
        this.standBtn = document.getElementById("standBtn");
    }

    addCard(card, who) {
        if (who == "player") {
            this.playerHand.appendChild(card.svgCard.display);
        } else if (who == "dealer") {
            this.dealerHand.appendChild(card.svgCard.display);
        } else {
            console.log("DomHandler: Unknown target container");
        }
    }

    clearBoard() {
        while (this.playerHand.firstChild) this.playerHand.firstChild.remove();
        while (this.dealerHand.firstChild) this.dealerHand.firstChild.remove();
    }

    updateScore(pScore, dScore) {
        this.playerValueBox.textContent = pScore;
        this.dealerValueBox.textContent = dScore;
    }

    updateStatus(msg) {
        this.statusBox.textContent = msg;
    }

    setButtons(state) {
        this.hitBtn.disabled = state;
        this.standBtn.disabled = state;
    }
}


class AnimationHandler {
    constructor(deckAnimation, deckPile) {
        this.deckAnimation = deckAnimation;
        this.deckPile = deckPile;
    }

    flipCard(card) {
        if (card && card.svgCard) {
            card.svgCard.dealerFlip();
        } else {
            console.log("AnimationHandler: Invalid card for flip");
        }
    }

    dealCard(card, container) {
        if (!card) {
            console.log("AnimationHandler: Missing card for deal");
            return;
        }

        const displayCard = card.svgCard.display;
        displayCard.style.opacity = "0";
        displayCard.style.transform = "scale(0.5) translateY(-30px)";
        displayCard.style.transition = "transform 0.3s ease, opacity 0.3s ease";

        container.appendChild(displayCard);

        setTimeout(function() {
            displayCard.style.opacity = "1";
            displayCard.style.transform = "scale(1) translateY(0)";
        }, 50); 
    }


    startWave() {
        if (this.deckAnimation) this.deckAnimation.startWave();
    }

    stopWave() {
        if (this.deckAnimation) this.deckAnimation.stopWave();
    }

    removePileCard() {
        if (this.deckPile) {
            this.deckPile.removeCard();
        }
    }
}



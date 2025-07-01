<script lang="ts">
    let diceSides = 6;
    let numDice = 1;
    let modifier = 0;
    let result = 0;

    function randomNumber(min: number, max: number): number {
        return Math.floor(
            Math.random() * (max - min + 1) + min
        );
    }

    function rollDice(
        numDice: number,
        diceSides: number,
        modifier: number
    ): void {
        let temp = 0;

        for (let i = 0; i < numDice; i++) {
            temp += randomNumber(1, diceSides);
        }

        temp += modifier;

        result = temp;
    }


</script>

<div class="container">
    <h1> Hello world2</h1>
</div>

<style>
    .container{ 
        display:flex;
    }
    .H1 {
        margin-left: auto;
        margin-right: auto;
        text-align: center;
    }

    .H4 {
        margin-left: auto;
        margin-right: auto;
        text-align: center;
    }

    .Dice-Roller-Result {
        margin-left: auto;
        margin-right: auto;
        text-align: center;
    }

    .Dice-Roller-Container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    .Dice-Roller-Button {
        margin-left: 4px;
    }

    .Dice-Roller-Button:hover {
        border: black 1px solid;
    }
</style>

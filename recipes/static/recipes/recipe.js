function decorateRecipe(containerId, ingredients) {
    if (!$(`#${containerId}`)) return;

    const IGNORED_WORDS = new Set([
        'the',
        'in',
        'or',
        'a',
        'for',
        'to',
        'on',
        'large',
        'small',
        'half',
        'f',
        'out',
        'sauce',
    ]);

    let containsIngredient = (ingredient) => {
        ingredient = ingredient.toLowerCase();
        if (IGNORED_WORDS.has(ingredient)) return 0;

        let regex = new RegExp(ingredient + "( |$)", "g");
        for (let i = 0; i < ingredients.length; i++) {
            if (ingredients[i].indexOf(ingredient) >= 0) {
                let match = regex.exec(ingredients[i]);
                if (!match) continue; // ignore incomplete words
                console.log({"ingredient": ingredient, "index": i + 1});
                return (i + 1);
            }
        }

        return 0;
    };

    let spanify = (ingredient, index) => {
        console.log({"spanify": true, "ingredient": ingredient, "index": index});
        return `<span class="step-ingredient-span" onmouseover="$('.food-span').eq(${index - 1}).css('background', '#ADD8E6')" onmouseout="$('.food-span').eq(${index - 1}).css('background', '#f9f9f9')">${ingredient}</span>`;
    };

    $(`#${containerId} .step-p`).each(function(i, element) {
        let words = element.innerHTML.split(" ");

        let decoratedHTML = "";
        let currentMatch = "";
        let currentIngredientIndex = 0;
        for (let i = 0; i < words.length; i++) {
            const word = words[i];

            if (word === '') continue;

            let regex = new RegExp("([a-zA-Z]+)(.*)", "g");
            let match = regex.exec(word);
            let isLastMatch = match && word !== match[1];

            if (!match) {
                if (currentMatch) {
                    decoratedHTML += (decoratedHTML === "" ? "" : " ") + spanify(currentMatch, currentIngredientIndex) + " " + word;
                    currentMatch = "";
                    currentIngredientIndex = 0;
                } else {
                    decoratedHTML += (decoratedHTML === "" ? "" : " ") + word;
                }
            } else if (!currentMatch && containsIngredient(match[1])) {
                if (isLastMatch) {
                    decoratedHTML += (decoratedHTML === "" ? "" : " ") + spanify(match[1], containsIngredient(match[1])) + match[2];
                } else {
                    currentIngredientIndex = containsIngredient(match[1]);
                    currentMatch = word;
                }
            } else if (currentMatch && containsIngredient(currentMatch + " " + match[1])) {
                if (isLastMatch) {
                    decoratedHTML += (decoratedHTML === "" ? "" : " ") + spanify(currentMatch + " " + match[1], containsIngredient(currentMatch + " " + match[1])) + match[2];
                    currentMatch = "";
                    currentIngredientIndex = 0;
                } else {
                    currentIngredientIndex = containsIngredient(currentMatch + " " + match[1]);
                    currentMatch += " " + word;
                }
            } else if (currentMatch) {
                let span = spanify(currentMatch, currentIngredientIndex);
                decoratedHTML += (decoratedHTML === "" ? "" : " ") + span + " " + word;
                currentMatch = "";
                currentIngredientIndex = 0;
            } else {
                decoratedHTML += (decoratedHTML === "" ? "" : " ") + word;
            }
        }

        element.innerHTML = decoratedHTML;
    });
}
from lxml import html
import json
import requests
import re
import validators

from pprint import pprint

def parse(url):
    if not validators.url(url):
        return { "error": "invalid url" }

    content = requests.get(url).content
    tree = html.fromstring(content)

    ingredientsList = []
    for div in tree.iter('div'):
        if ('class' in div.attrib):
            if ('ingredient' in div.attrib['class']):
                # print('x: {}'.format(div.resolve_base_href()))
                text = "".join(div.itertext())
                ingredients = re.split('[\n]{2,}', text)
                for ingredient in ingredients:
                    ingredient = ' '.join(re.split('[\n]+', ingredient))
                    if (ingredient == ''):
                        continue

                    if (ingredient not in ingredientsList):
                        ingredientsList.append(ingredient)

                #print('text: {}'.format(text))

    directionsList = []
    for div in tree.iter('div'):
        if ('class' in div.attrib):
            if ('direction' in div.attrib['class'] or 'instruction' in div.attrib['class'] or 'steps' in div.attrib['class']):
                text = "".join(div.itertext())
                directions = re.split('[\n]{2,}', text)
                for direction in directions:
                    direction = ' '.join(re.split('[\n]+', direction))
                    if (direction == ''):
                        continue

                    if (direction not in directionsList):
                        directionsList.append(direction)

                #print('text: {}'.format(text))

    # print(ingredientsList)
    # print(directionsList)

    return { "ingredients": ingredientsList, "directions": directionsList }

def printRecipe(data):
    #print("Ingredients:")
    for ingredient in data["ingredients"]:
        print(ingredient)
    #print("Directions:")
    for step in data["directions"]:
        print(step)
    
if __name__ == "__main__":
    #parse('https://feedmephoebe.com/red-lentil-recipe/')
    #p = parse('https://thewoksoflife.com/mongolian-beef-recipe/')
    #p = parse('https://www.inspiredtaste.net/15938/easy-and-smooth-hummus-recipe/')
    #p = parse('https://www.allrecipes.com/recipe/35151/traditional-filipino-lumpia/')
    p = parse('https://www.dimitrasdishes.com/greek-roast-leg-of-lamb/')
    printRecipe(p)
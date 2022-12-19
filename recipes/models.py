"""
Recipes
"""
from django.db import models
from django.utils import timezone
import re

UNITS = {
    'ml',
    'l',
    'dl',
    'teaspoon',
    'tablespoon',
    'cup',
    'pint',
    'quart',
    'gallon',
    'mg',
    'g',
    'kg',
    'pound',
    'ounce',
}

class Ingredient:
    def __init__(self, quantity, unit, food):
        self.quantity = quantity
        self.unit = unit
        self.food = food

    def __str__(self):
        return f'{str(self.quantity)},{self.unit},{self.food}'


class Recipe(models.Model):
    """
    Recipe Model
    """
    create_date = models.DateField(default=timezone.now)
    name = models.CharField(max_length = 128, null = False)
    name_slug = models.SlugField(max_length = 128, null = False)
    ingredient_text = models.TextField(max_length = 8192, null = False)
    direction_text = models.TextField(max_length = 8192, null = False)

    def decompose_ingredients(self):
        ingredients = []

        for ingredient in self.ingredient_text.split('\n'):
            quantity_pattern = re.compile('[0-9\u00BC-\u00BE\u2150-\u215E]+')

            quantity = unit = food = ""

            def get_quantity(string):
                match = quantity_pattern.match(string)
                if match:
                    return match.group(0)

            def get_unit(string):
                string = string.lower()
                if string[-1] is 's':
                    string = string[:-1]
                if string in UNITS:
                    return string

            for split in ingredient.split(' '):
                if not split:
                    continue

                if q := get_quantity(split):
                    quantity = q
                elif u := get_unit(split):
                    unit = u
                else:
                    food += ("" if not food else " ") + split.strip()

            ingredients.append(Ingredient(quantity, unit, food))

        return ingredients

    def __str__(self):
        return f'{str(self.create_date)},{self.name},{self.name_slug},{self.ingredient_text},{self.direction_text}'

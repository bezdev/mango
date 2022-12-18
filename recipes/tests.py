from django.test import TestCase
from django.template.defaultfilters import slugify

from .models import Recipe

class RecipeTests(TestCase):
    def setUp(self):
        Recipe.objects.create(name="Traditional Filipino Lumpia", name_slug=slugify("Traditional Filipino Lumpia"), ingredient_text="1 tablespoon vegetable oil\n1 pound ground pork\n½ cup chopped onion\n2 cloves garlic, crushed\n½ cup minced carrots\n½ cup chopped green onions\n½ cup thinly sliced green cabbage\n2 tablespoons chopped fresh cilantro (Optional)\n1 teaspoon ground black pepper\n1 teaspoon salt\n1 teaspoon garlic powder\n1 teaspoon soy sauce\n30  lumpia wrappers\n2 cups vegetable oil for frying, or as needed", direction_text="Heat 1 tablespoon vegetable oil in a wok or large skillet over high heat. Add pork; cook and stir until crumbly and no pink is showing, 5 to 7 minutes. Remove pork from the pan and set aside. Drain grease from the pan, leaving just a thin coating.\nAdd onion and garlic to the pan; cook and stir until fragrant, about 2 minutes. Stir in the cooked pork, carrots, green onions, cabbage, and cilantro. Season with pepper, salt, garlic powder, and soy sauce. Remove from the heat, and set aside until cool enough to handle, about 5 minutes.\nAssemble lumpia: Place 3 heaping tablespoons of filling diagonally near one corner of a lumpia wrapper, leaving a 1 1/2 inch space at both ends. Fold the side along the length of the filling over the filling, tuck in both ends, and roll neatly and tightly to close. Moisten the other side of the wrapper with water to seal the edge. Transfer to a plate and cover with plastic wrap to retain moisture. Repeat to assemble remaining lumpia.\nHeat 1/2 inch vegetable oil in a heavy skillet over medium heat for 5 minutes.\nSlide 3 to 4 lumpia into the hot oil, making sure the seams are facing down. Fry, turning occasionally, until all sides are golden brown, 1 to 2 minutes. Transfer to a paper towel-lined plate to drain. Repeat to fry remaining lumpia. Serve immediately.")

    def test_recipe_decompose(self):
        ingredients = Recipe.objects.filter(name='Traditional Filipino Lumpia').first().decompose()
        for ingredient in ingredients:
            print(ingredient)

        self.assertEqual("meow", "mefow")

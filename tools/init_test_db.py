from recipes.models import Recipe
from notes.models import Note
from django.template.defaultfilters import slugify

import random

def create_recipes():
    # createdate = models.DateField(default=timezone.now)
    # name = models.CharField(max_length = 128, null = False)
    # nameSlug = models.SlugField(max_length = 128, null = False)
    # ingredientsText = models.TextField(max_length = 8192, null = False)
    # directionsText = models.TextField(max_length = 8192, null = False)
    MEAT_DISHES = [ 'Anticucho', 'Asocena', 'Baeckeoffe', 'Barbacoa', 'Berner Platte', 'Beşbarmaq', 'Birria', 'Bobotie', 'Boliche', 'Bosintang', 'Braciola', 'Breaded cutlet', 'Brunswick stew', 'Burgoo', 'Cabeza guateada', 'Capuns', 'Carimañola', 'Carne a la tampiqueña', 'Carne pinchada', 'Carne pizzaiola', 'Carpaccio', 'Chiles en nogada', 'Chislic', 'Chunla', 'Churrasco', 'Çiğ köfte', 'City chicken', 'Cockentrice', 'Compote', 'Curanto', 'Discada', 'Durus kura', 'Chittagonian Musallam', 'Enchilada', 'Escalope', 'Farsu magru', 'Fatányéros', 'Finnbiff', 'Flurgönder', 'Fricassee', 'Frigărui', 'Giouvetsi', 'Güveç', 'Guyanese pepperpot', 'Gyro', 'Hachee', 'Haggis', 'Hodge-Podge', 'Inihaw', 'Jerusalem mixed grill', 'Jugging', 'Kaalilaatikko', 'Kachilaa', 'Kelaguen', 'Khorovats', 'Kibbeh nayyeh', 'Kielbasa', 'Kiviak', 'Kohlwurst', 'Koi', 'Korean barbecue', 'Kutti pi', 'Larb khua mu', 'Larb', 'Laurices', 'Lawar', 'Lihapiirakka', 'Lomo a lo pobre', 'Lörtsy', 'Maksalaatikko', 'À la Maréchale', 'Meatcake', 'Menchi-katsu', 'Mett', 'Mikoyan cutlet', 'Mixed grill', 'Mixed-meat mixiote', 'Mixiote', 'Mykyrokka', 'Naryn', 'Nem nguội', 'Pachamanca', 'Pachola', 'Pamplona', 'Pastramă', 'Peremech', 'Pljeskavica', 'Po', 'Poc Chuc', 'Poronkäristys', 'Potjevleesch', 'Poume doranges', 'Pringá', 'Pukala', 'Pyttipanna', 'Qingtang wanzi', 'Rat-on-a-stick', 'Ražnjići', 'Renskav', 'Riz gras', 'Rundstück warm', 'Sanjeok', 'Sapu Mhicha', 'Saramură', 'Sate kambing', 'Satti', 'Sauerbraten', 'Sautéed reindeer', 'Schäufele', 'Schlachteplatte', 'Seco', 'Seswaa', 'Shaokao', 'Shish kebab', 'Shuizhu', 'Smokie', 'Souvlaki', 'Speckkuchen', 'Ssam', 'Stew peas', 'Suanla chaoshou', 'Surf and turf', 'Swan Puka', 'Tataki', 'Teste de Turke', 'Toad in the hole', 'Turducken', 'Tushonka', 'Wurstsalat', 'Xab Momo', 'Yakiniku', 'Zoervleis' ]

    ingredients = 'ingredient1\ningrendient2\ningredient3'
    directions = 'step1\nstep2\nstep3'

    Recipe.objects.all().delete()

    for dish in MEAT_DISHES:
        r = Recipe(name=dish, name_slug=slugify(dish), ingredient_text=ingredients, direction_text=directions)
        r.save()

    Recipe.objects.all()

def create_notes():
    NOTES = [ 'django', 'python', 'sql', 'bash', 'diablo2' ]
    TAGS = [ 'programming', 'food', 'work' ]
    TEXTS = ''
    Note.objects.all().delete()
    Tag.objects.all().delete()

    for note in NOTES:
        n = Note(name = note, name_slug = slugify(note))

create_recipes()
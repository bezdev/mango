from django import template

register = template.Library()

# @register.simple_tag
# def onload(code):
#     return f'<script bez-on-load>if (document.readyState === "complete") {{ {code} }}</script>'
# @register.simple_tag
# def onload():
#     return 'if (document.readyState === "complete") {'

# @register.simple_tag
# def endonload():
#     return "}"
@register.tag
def onload(parser, token):
    nodelist = parser.parse(('endonload',))
    parser.delete_first_token()

    return OnloadNode(nodelist)

class OnloadNode(template.Node):
    def __init__(self, nodelist):
        self.nodelist = nodelist

    def render(self, context):
        context.autoescape = False

        code = self.nodelist.render(context)
        wrapped_code = f'<script bez-on-load>if (document.readyState !== "loading") {{ {code} }}</script>'
        context.autoescape = True

        return wrapped_code

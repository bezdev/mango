from django import template

register = template.Library()

@register.simple_tag
def onload():
    return "if (document.readyState === 'complete') {"

@register.simple_tag
def endonload():
    return "}"

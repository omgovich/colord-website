import { extend } from 'colord'
import a11yPlugin from 'colord/plugins/a11y'
import cmykPlugin from 'colord/plugins/cmyk'
import harmoniesPlugin from 'colord/plugins/harmonies'
import hwbPlugin from 'colord/plugins/hwb'
import lchPlugin from 'colord/plugins/lch'
import namesPlugin from 'colord/plugins/names'

extend([a11yPlugin, cmykPlugin, harmoniesPlugin, hwbPlugin, lchPlugin, namesPlugin])

export * from 'colord'
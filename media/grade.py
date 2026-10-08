from PIL import Image, ImageFilter, ImageDraw
import numpy as np, random
def grade(im, shadow=(14,22,48), high=(255,246,226), amt=0.22, vign=0.28, contrast=1.06):
    a=np.asarray(im.convert('RGB')).astype(np.float32)/255
    lum=(0.2126*a[...,0]+0.7152*a[...,1]+0.0722*a[...,2])[...,None]
    s=np.array(shadow)/255; h=np.array(high)/255
    ws=np.clip(1-lum*1.6,0,1)**1.5; wh=np.clip((lum-0.55)/0.45,0,1)**2
    a=a*(1-amt*ws)+s*(amt*ws); a=a*(1-0.12*wh)+h*(0.12*wh)
    a=np.clip((a-0.5)*contrast+0.5,0,1)
    gray=(0.2126*a[...,0]+0.7152*a[...,1]+0.0722*a[...,2])[...,None]; a=gray+(a-gray)*0.92
    H,W=a.shape[:2]; y,x=np.ogrid[:H,:W]
    r=np.sqrt(((x-W/2)/(W/2))**2+((y-H/2)/(H/2))**2); v=1-vign*np.clip(r-0.55,0,1)**1.6
    a=a*v[...,None]+s*(1-v[...,None])*0.5
    return Image.fromarray((np.clip(a,0,1)*255).astype(np.uint8))
def sparkles(im, pts):
    base=im.convert('RGBA'); layer=Image.new('RGBA',base.size,(0,0,0,0)); d=ImageDraw.Draw(layer)
    for x,y,L in pts:
        d.line([(x-L,y),(x+L,y)],fill=(255,246,220,110),width=1); d.line([(x,y-L*0.8),(x,y+L*0.8)],fill=(255,246,220,110),width=1)
        d.ellipse([x-1.3,y-1.3,x+1.3,y+1.3],fill=(255,250,235,240))
    glow=layer.filter(ImageFilter.GaussianBlur(3))
    out=Image.alpha_composite(base,glow); out=Image.alpha_composite(out,layer.filter(ImageFilter.GaussianBlur(0.4)))
    return out.convert('RGB')

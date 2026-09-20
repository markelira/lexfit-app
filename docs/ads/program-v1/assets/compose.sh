#!/bin/bash
# final-v2 compositor.
#   compose3.sh ground out OW OH figH figX figBot phH phX phBot
# figH/phH  : element height as a fraction of canvas height
# figX/phX  : horizontal offset from canvas centre, fraction of canvas width
# figBot/phBot : distance from the BOTTOM edge to the element's base, fraction of H
#
# Everything is positioned from the bottom because the constraint that matters
# is clearance above the CTA pill - a top-anchored layout drifts into it as the
# figure is resized.
set -e
cd "$(dirname "$0")"
G=$1; OUT=$2; OW=$3; OH=$4; FH=$5; FX=$6; FB=$7; PH=$8; PX=$9; PB=${10}

W=$(magick identify -format "%w" "$G"); H=$(magick identify -format "%h" "$G")
px(){ python3 -c "print(int($1))"; }

# Phone: essentially sharp. It is the product, so it has to be readable as an
# app - the earlier heavy blur turned it into an anonymous grey slab.
# phoneH of 0 skips the mockup entirely - on the narrow landscape band the
# headline leaves no room for it, and she is already holding a phone.
if [ "$PH" = "0" ]; then
  cp "$G" _base.png
else
PHH=$(px "$H*$PH")
magick phone-mockup.png -resize x${PHH} -blur 0x2.2 _p1.png
magick _p1.png \( +clone -background "#243029" -shadow 34x$(px "$PHH*0.02")+0+$(px "$PHH*0.008") \) \
  +swap -background none -layers merge +repage _phone_s.png
magick "$G" _phone_s.png -gravity south -geometry +$(px "$W*$PX")+$(px "$H*$PB") -composite _base.png
fi

# Figure: thin white sticker outline (heavy reads as a halo on cream) + shadow.
FIGH=$(px "$H*$FH")
BORD=$(px "max(8,$FIGH*0.010)"); DISK=$(px "max(3,$FIGH*0.0040)")
magick alexa-v3.png -resize x${FIGH} _f1.png
magick _f1.png -bordercolor none -border ${BORD} \
  \( +clone -alpha extract -morphology Dilate Disk:${DISK} -background white -alpha Shape \) \
  +swap -composite _f2.png
magick _f2.png \( +clone -background "#2f3f38" -shadow 26x$(px "$BORD+5")+0+$(px "$BORD/2") \) \
  +swap -background none -layers merge +repage _fig.png

magick _base.png \
  _fig.png -gravity south -geometry +$(px "$W*$FX")+$(px "$H*$FB") -composite \
  _st.png
# Resize to the delivery size WITHOUT cropping - the ground already carries the
# right aspect and a safe margin, so a fill-crop would clip the bubbles again.
magick _st.png -resize ${OW}x${OH}! -strip -quality 96 "$OUT"
rm -f _p1.png _phone_s.png _base.png _f1.png _f2.png _fig.png _st.png
echo "$(basename $OUT)  $(magick identify -format '%wx%h' "$OUT")"

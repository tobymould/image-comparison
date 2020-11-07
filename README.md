# Image similarity algorithm

When a user posts on Candide, we might assume that they would be interested in
posts similar to theirs, or at least referring to similar content. One way to do
this might be to find other posts with similar images to theirs.

We have made 20 plant images available (check the source code). We have also
provided a dataset of labels from the Google Cloud Vision API for those images
(see `data.json`), which could help, although its use is not a requirement.

### The task

If I were to post any one of the 20 images, which of the other 19 would be
relevant to show to me as "other posts like yours"?

We want you to write an algorithm that uses the data we provide to figure out which
images are most similar.

### Guidance

There is certainly no right or wrong answer to this. Yours may not be the most efficient
or scalable solution, but you should understand its strengths and weaknesses and be
prepared to provide potential solutions to these things.

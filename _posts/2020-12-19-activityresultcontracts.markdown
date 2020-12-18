---
layout: post
title: "AndroidX ActivityResultContracts"
date: "2020-12-19 00:05:22 +0100"
tag: android
---
Starting with the [AndroidX Activity 1.2.0-alpha02](https://developer.android.com/jetpack/androidx/releases/activity#1.2.0-alpha02) and [AndroidX Fragment 1.3.0-alpha02](https://developer.android.com/jetpack/androidx/releases/fragment#1.3.0-alpha02) artifacts the Activity result ceremony will never be the same.

Let's forget about `startActivityForResult()` and `onActivityResult()`, they really need some rest after being available since day 0 on the Android SDK.

## What are ActivityResultContracts

> An ActivityResultContract defines the input type needed to produce a result along with the output type of the result.

The [ActivityResultContracts](https://developer.android.com/reference/androidx/activity/result/contract/ActivityResultContracts) class contains many contracts for basic actions like taking a picture and requesting permissions, and most likely that list will grow, *but there's more*: you can create custom contracts to better fulfill your needs.

## Custom contracts

Let's go straight to the point.
Here's an example of a custom one I needed in order to open the media gallery to pick some content...
```kotlin
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.activity.result.contract.ActivityResultContract

class PickPhotoActivityContract : ActivityResultContract<String, Uri?>() {

    override fun createIntent(context: Context, input: String) =
        Intent(
            Intent.ACTION_PICK,
            android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI
        ).apply { type = input }

    override fun parseResult(resultCode: Int, intent: Intent?) =
        intent?.data?.takeIf { resultCode == Activity.RESULT_OK }
}
```
...and this is how to use it on a `Fragment` or `Activity`, for instance I'd like to pick an image from the gallery:
```kotlin
private val pickPhotoLauncher = registerForActivityResult(PickPhotoActivityContract()) { uri ->
    uri?.let {
      // Do anything with it
    }
}
...
viewBinding.button.setOnClickListener {
    pickPhotoLauncher.launch("image/*")
}
```

As you can see a contract has to implement two methods:
- [createIntent(...)](https://developer.android.com/reference/androidx/activity/result/contract/ActivityResultContract#createIntent(android.content.Context,%20I)) to create a well-formed Intent with any extras needed starting from the specified type (`String` in the example above)
- [parseResult(...)](https://developer.android.com/reference/androidx/activity/result/contract/ActivityResultContract#parseResult(int,%20android.content.Intent)) to map the result to an appropriate data model (`Uri` in the example above, it's nullable to handle failures and cancellations)

## References

The [official documentation](https://developer.android.com/training/basics/intents/result) is the way to go to get a lot more context and see many examples of the expected usage.

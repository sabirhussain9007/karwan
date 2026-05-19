import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import { isDisplayableAvatar } from "@/lib/avatar-utils";

type OAuthProfile = {
  email?: string | null;
  name?: string | null;
  image?: string | null;
};

/** Find or create a MongoDB user for Google (and other OAuth) sign-in. */
export async function syncOAuthUser(profile: OAuthProfile) {
  const email = profile.email?.toLowerCase().trim();
  if (!email) {
    throw new Error("Google account did not return an email address");
  }

  await connectToDatabase();

  let user = await User.findOne({ email });

  const avatarFromProvider =
    profile.image && isDisplayableAvatar(profile.image) ? profile.image : "";

  if (!user) {
    user = await User.create({
      name: profile.name?.trim() || email.split("@")[0],
      email,
      role: "user",
      avatar: avatarFromProvider,
    });
  } else if (avatarFromProvider && !user.avatar) {
    user.avatar = avatarFromProvider;
    await user.save();
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role || "user",
  };
}

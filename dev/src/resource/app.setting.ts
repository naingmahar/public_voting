const limit = 8
export const Setting= {
    deafultLimit: limit,
    skipLimit:(start=>({start:parseInt(start) >= 0?start:0,limit:limit}))
}

export const VotingType = {
    Selection : "SELECTION",
    Rating: "RATING",
    YesNo: "YESNO"
}

export const AppColor = {
    FACEBOOK:"rgb(59, 89, 153)",
    TWITTER:"rgb(0, 172, 238)",
    GOOGLE:"rgb(228, 43, 38)",
    LINKEDIN:"rgb(42, 106, 178)",
    ANONYMOUS:"rgb(93, 166, 38)"
}

export const AppIconSize = {
    LOGIN:40
}

export const CommonText = {
    FACEBOOK:"Facebook",
    TWITTER:"Twitter",
    GOOGLE:"Google",
    LINKEDIN:"LinkedIn",
    ANONYMOUS:"I'm anonymous."
}

export const StoreKey = {
    AUTH: "auth"
}
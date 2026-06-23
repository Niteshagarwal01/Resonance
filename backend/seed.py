import json
import time
from ytmusicapi import YTMusic

yt = YTMusic()

ARTISTS = [
    "The Weeknd", "Bruno Mars", "Taylor Swift", "Ed Sheeran", "Justin Bieber",
    "Billie Eilish", "Ariana Grande", "Drake", "Eminem", "Post Malone",
    "Dua Lipa", "Olivia Rodrigo", "SZA", "Coldplay", "Imagine Dragons",
    "Charlie Puth", "Harry Styles", "Adele", "Shawn Mendes", "Selena Gomez",
    "BTS", "BLACKPINK", "Jungkook", "Jimin", "V",
    "Lisa", "Jennie", "Rosé", "Stray Kids", "NewJeans",
    "Arijit Singh", "Pritam", "Shreya Ghoshal", "A.R. Rahman", "Sachin-Jigar",
    "Vishal-Shekhar", "Tanishk Bagchi", "Jubin Nautiyal", "Sonu Nigam", "Sunidhi Chauhan",
    "Atif Aslam", "Mohit Chauhan", "Armaan Malik", "KK", "B Praak",
    "Asees Kaur", "Neha Kakkar", "Mithoon", "Shaan", "Sukhwinder Singh",
    "Udit Narayan", "Alka Yagnik", "Badshah", "Yo Yo Honey Singh", "Tulsi Kumar",
    "Anirudh Ravichander", "Sid Sriram", "Devi Sri Prasad", "Thaman S", "Yuvan Shankar Raja",
    "Dhee", "Karthik", "Haricharan", "Vijay Prakash", "Santhosh Narayanan",
    "Anuv Jain", "Prateek Kuhad", "When Chai Met Toast", "The Local Train", "Ritviz",
    "OAFF", "Abdul Hannan", "Aditya Rikhari", "Dream Note", "Taba Chake",
    "Nikhil D'Souza", "Raman Negi", "Anumita Nadesan", "Akshath", "Bharath Sankar",
    "Karan Aujla", "AP Dhillon", "Shubh", "Divine", "Seedhe Maut",
    "KR$NA", "Emiway Bantai", "Raftaar", "MC Stan", "Talha Anjum",
    "Talhah Yunus", "Young Stunners", "King", "Ikka", "Hanumankind",
    "Raga", "Karma", "Bella", "Paradox", "MC Square"
]

SONGS = [
    "Kesariya", "Apna Bana Le", "Heeriye", "Tum Hi Ho", "Agar Tum Saath Ho",
    "O Maahi", "Chaleya", "Tere Vaaste", "Raanjhan", "Sajni",
    "Satranga", "Tum Kya Mile", "Soulmate", "Pehle Bhi Main", "Shayad",
    "Hawayein", "Raabta", "Khairiyat", "Ve Kamleya", "Tera Hone Laga Hoon",
    "Kaise Hua", "Mast Magan", "Samjhawan", "Darkhaast", "Ae Dil Hai Mushkil",
    "Phir Le Aaya Dil", "Channa Mereya", "Ilahi", "Safarnama", "Kun Faya Kun",
    "Admirin You", "Softly", "With You", "Winning Speech", "Tauba Tauba",
    "Wavy", "52 Bars", "Brown Munde", "Excuses", "Insane",
    "Cheques", "Baller", "Obsessed", "Khat", "White Brown Black",
    "Hola Amigo", "Khatta Flow", "KOD", "Legacy vs Clout", "No Cap",
    "Wanna Know", "Machayenge 4", "Sheesha", "Baazigar", "Still Here",
    "Kaha Tak", "Nanchaku", "Agency", "Downers At Dusk", "Gumaan",
    "Class Sikh Maut Vol. II", "Anaadi", "3:59 AM", "Galat Karam", "Big Dawgs",
    "Jo Tum Mere Ho", "Husn", "Baarishein", "Kasoor", "Gul",
    "Finding Her", "Ishq", "Alag Aasmaan", "Riha", "Aaoge Tum Kabhi",
    "Choo Lo", "Arz Kiya Hai", "Sajde", "Suniyan Suniyan", "Aaftab",
    "Blinding Lights", "Die With A Smile", "APT.", "BIRDS OF A FEATHER", "Espresso",
    "Cruel Summer", "Shape of You", "Perfect", "STAY", "Starboy",
    "Dynamite", "Butter", "Seven", "How You Like That", "Magnetic",
    "Hukum", "Vikram Title Track", "Arabic Kuthu", "Rowdy Baby", "Fear Song"
]

def get_thumbnail(thumbnails):
    if not thumbnails: return None
    if isinstance(thumbnails, list) and len(thumbnails) > 0:
        return thumbnails[-1].get("url")
    if isinstance(thumbnails, str): return thumbnails
    return None

def seed_data():
    out_artists = []
    print("Fetching Artists...")
    for a in ARTISTS:
        try:
            res = yt.search(a, filter="artists", limit=1)
            if res:
                item = res[0]
                out_artists.append({
                    "id": item.get("browseId"),
                    "name": item.get("artist", a),
                    "image": get_thumbnail(item.get("thumbnails")),
                    "subscribers": item.get("subscribers", "")
                })
                print(f"OK Artist: {a} -> {item.get('artist', a)}")
            else:
                out_artists.append({"id": "fallback", "name": a, "image": None, "subscribers": ""})
                print(f"FAIL Artist Not Found: {a}")
            time.sleep(0.5)
        except Exception as e:
            print(f"ERROR artist {a}: {e}")

    out_songs = []
    print("\nFetching Songs...")
    for s in SONGS:
        try:
            res = yt.search(s, filter="songs", limit=1)
            if res:
                item = res[0]
                artists_str = ", ".join([art.get("name", "") for art in item.get("artists", [])]) if item.get("artists") else ""
                out_songs.append({
                    "id": item.get("videoId"),
                    "title": item.get("title", s),
                    "artist": artists_str,
                    "thumbnail": get_thumbnail(item.get("thumbnails"))
                })
                print(f"OK Song: {s} -> {item.get('title', s)}")
            else:
                out_songs.append({"id": "fallback", "title": s, "artist": "Unknown", "thumbnail": None})
                print(f"FAIL Song Not Found: {s}")
            time.sleep(0.5)
        except Exception as e:
            print(f"ERROR song {s}: {e}")

    # Save to JSON
    out_path = "../frontend/src/lib/onboardingData.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({"artists": out_artists, "songs": out_songs}, f, indent=2, ensure_ascii=False)
    
    print(f"\nDone! Saved to {out_path}")

if __name__ == "__main__":
    seed_data()

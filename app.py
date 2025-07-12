from flask import Flask,jsonify,request
from models import  bcrypt, get_db_connection, add_quiz, add_question_from_master, add_ques_llm, create_quiz, create_quiz_master, recording_issue, record_feedback,create_quiz_by_id, add_question_to_db, add_theme_if_not_exists, profile_added_db, view_profile_db, view_quiz_score_db, get_recent_quizzes_db, fetch_quiz_for_theme_db, get_quiz_details_db
from config import Config
from signup import signup_route
from login import login_route
from submit_response import submit_quiz
import traceback
import threading
import urllib.parse
from generate_question import generate_ques
from generate_ques_random import generate_question_random
import logging
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from beat_the_ai import beat_the_ai
from question_verify import verify_question
import re
import mysql.connector
from contin_gen import continuous_generation



from leader_board import leaderboard_overall, leaderboard_daily,leaderboard_theme, leaderboard_weekly

logging.basicConfig(
    filename='app.log',
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
app = Flask(__name__)
app.config.from_object(Config)



@app.route('/')
def home():
    return jsonify({"message": "Quiz App is Running", "status": "success"})



bcrypt.init_app(app)

jwt = JWTManager(app)



@app.route("/signup", methods = ['GET','POST'])
def signup():
    logging.info("Signup route accessed")
    return signup_route()

@app.route("/login",methods = ['GET','POST'])
def login():
    logging.info("Login route accessed")
    return login_route()

@app.route('/submit_quiz', methods=['POST'])
@jwt_required()
def submit_quiz_route():
    logging.info("Submit quiz route accessed")
    return submit_quiz()


@app.route('/leaderboard_overall', methods=['GET'])
@jwt_required()
def leaderboard_overall_route():
    logging.info("Overall leaderboard route accessed")
    return leaderboard_overall()

@app.route('/leaderboard_daily', methods=['GET'])
@jwt_required()
def leaderboard_daily_route():
    logging.info('Daily leaderboard route accessed')
    return leaderboard_daily()  

@app.route('/leaderboard_weekly', methods=['GET'])
@jwt_required()
def leaderboard_weekly_route():
    logging.info('Weekly leaderboard route accessed')
    return leaderboard_weekly()   

@app.route('/leaderboard_theme', methods=['GET'])
@jwt_required()
def leaderboard_theme_route():
    logging.info('theme-wise leaderboard route accessed')
    return leaderboard_theme()   

@app.route('/add_question_master', methods=['POST'])
@jwt_required()
def add_question_master():
    logging.info('add_question by master route accessed')
    status = add_question_from_master() 
    if status == 'True':
        return jsonify({"message": "Question added to question bank"}), 201
    elif status == "Duplicate":
        logging.info("Duplicate question detected for the user.")
        return jsonify({"error": "Duplicate question detected."}), 400
    else:
        return jsonify({"error": "Failed to add question in the database."}), 500


@app.route('/add_question_llm', methods=['POST'])
@jwt_required()
def add_question_route():
    logging.info('add question route accessed')
    if request.method == 'POST':
        logging.info("Received a POST request to add a question to the question bank.")

        theme = request.form.get('theme')
        theme = theme.lower()
        
        
        add_theme_if_not_exists(theme)

        if not theme:
            return jsonify({"error": "Please provide the theme."}), 400

        while True:
            
            ques = generate_ques(theme)
            logging.debug("Generated question from LLM: %s", ques)

        
            question_match = re.search(r'Question:\s*(.*)', ques)
            options_matches = re.findall(r'([A-D])\)\s*(.*)', ques)
            correct_answer_match = re.search(r'Correct answer:\s*([A-D])', ques)
            difficulty_match = re.search(r'Difficulty level:\s*(.*)', ques)

            if question_match and options_matches and correct_answer_match:
                question = question_match.group(1).strip()
                options = [f"{opt[0]}) {opt[1].strip()}" for opt in options_matches]
                correct_option = correct_answer_match.group(1).strip().upper()
                difficulty = difficulty_match.group(1).strip()

                logging.debug("Parsed question: %s", question)
                logging.debug("Parsed options: %s", options)
                logging.debug("Parsed correct option: %s", correct_option)
                logging.debug("Parsed difficulty: %s", difficulty)

                
                if correct_option not in ['A', 'B', 'C', 'D']:
                    return jsonify({"error": "The correct option is invalid."}), 400
                
                
                status = add_ques_llm(theme, question, options, correct_option, difficulty)

                if status == 'True':
                    return jsonify({"message": "Question added to question bank"})
                elif status == "Duplicate":
                    logging.info("Duplicate question detected, generating a new question.")
                    continue  
                else:
                    return jsonify({"error": "Failed to add question in the database."}), 500
            else:
                return jsonify({"error": "Question format is incorrect or missing correct option."}), 400
            


@app.route('/create_quiz_master', methods=['POST'])
@jwt_required()
def create_quiz_master_route():
    logging.info('create quiz master route accessed')
    
    user_id_creator = get_jwt_identity()
    if request.method == 'POST':
        theme = request.form.get('theme')
        theme = theme.lower()
        add_theme_if_not_exists(theme)
        num_questions = request.form.get('num_questions')

        if not theme or not num_questions.isdigit() or int(num_questions) <= 0 or int(num_questions) >= 11:
            return jsonify({"error": "Please provide a valid theme and a positive integer less than or equal to 10 for the number of questions."}), 400
        return create_quiz_master(user_id_creator, theme, num_questions)   

@app.route('/report', methods=['POST'])
@jwt_required()
def report_route():
    logging.info('report route accessed')
    user_id = get_jwt_identity()
    
    if request.method == 'POST':
        theme = request.form.get('theme')
        theme = theme.lower()
        ques_id= request.form.get('ques_id')
        issue_description = request.form.get('issue_description')

    if not ques_id or not issue_description or not theme:
        return jsonify({"error":"Missing ques_id,issue_description or theme"}),400
    
    return recording_issue(theme,ques_id,issue_description)


@app.route('/submit_feedback', methods=['POST'])
@jwt_required()
def submit_feedback():
    user_id = get_jwt_identity()
    rating= request.form.get('rating')
    comments=request.form.get('comments')
    if not user_id or not rating:
        return jsonify({"error": "user_id and rating are required"}), 400
    return record_feedback(user_id, rating, comments)



@app.route('/create_quiz_from_bank', methods=['POST'])
@jwt_required()
def create_quiz_id_route():
    logging.info('create quiz route accessed')
    
    
    if request.method == 'POST':
        theme = request.form.get('theme')
        theme = theme.lower()

        num_questions = request.form.get('num_questions')

        if not theme or not num_questions or not str(num_questions).isdigit() or int(num_questions) <= 0:
            return jsonify({"error": "Please provide a valid theme and a positive integer for the number of questions."}), 400
        return create_quiz_by_id(theme, num_questions)
    

@app.route('/generate_question_random_theme', methods=['POST'])
def generate_question_random_endpoint():
    while True:  
        generated_content = generate_question_random().strip()
        pattern = re.compile(r"""
            Theme:\s*(?P<theme>.*?)\n
            Question:\s*(?P<question>.*?)\n
            A\)\s*(?P<option_a>.*?)\n
            B\)\s*(?P<option_b>.*?)\n
            C\)\s*(?P<option_c>.*?)\n
            D\)\s*(?P<option_d>.*?)\n
            Correct\s*answer:\s*(?P<correct_option>[A-D])\n
            Difficulty\s*level:\s*(?P<difficulty>\w+)
        """, re.VERBOSE | re.DOTALL)
        
        match = pattern.search(generated_content)
        if match:
            theme = match.group("theme").strip()
            theme = theme.lower()
            
            add_theme_if_not_exists(theme)
            question = match.group("question").strip()
            # Combine question and options into one string.
            question_options = (
                f"{question}\n"
                f"A) {match.group('option_a').strip()}\n"
                f"B) {match.group('option_b').strip()}\n"
                f"C) {match.group('option_c').strip()}\n"
                f"D) {match.group('option_d').strip()}"
            )
            correct_option = match.group("correct_option").strip()
            difficulty = match.group("difficulty").strip()
            
           
            print("Storing data in database...")
            print(f"Theme: {theme}")
            print("Question and Options:")
            print(question_options)
            print(f"Correct Option: {correct_option}")
            print(f"Difficulty: {difficulty}")
            print("-" * 40)
            db_response = add_question_to_db(theme, question_options, correct_option, difficulty)
        
            if db_response == "Duplicate":
             print("Duplicate detected! Regenerating...")
             continue 
            elif db_response is None:
             return jsonify({"error": "Database insertion failed"}), 500
            else:
             return jsonify({
                "message": "Question added successfully!",
                "theme": theme,
                "question": question,
                
                "difficulty": difficulty
            })

        else:
            print("Parsing failed for the following content:")
            print(generated_content)

@app.route('/add_theme', methods=['POST'])
@jwt_required()
def add_theme():
    logging.info('Add theme route accessed')
    try:

        if request.method == 'POST':
            theme = request.form.get('theme')
            theme = theme.lower()

        if not theme:
                return jsonify({"error": "Theme is required"}), 400
        
        theme_added = add_theme_if_not_exists(theme)

        if theme_added:
            return jsonify({"message": "Theme added successfully"}), 201
        else:
            return jsonify({"message": "Theme already exists"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
 
@app.route('/beat_the_ai', methods=['POST'])
@jwt_required()
def beat_the_ai_endpoint():
    theme = request.form.get('theme')
    theme = theme.lower()
    add_theme_if_not_exists(theme)
    while True:  
        generated_content = beat_the_ai(theme).strip()
        pattern = re.compile(r"""
            Theme:\s*(?P<theme>.*?)\n
            Question:\s*(?P<question>.*?)\n
            A\)\s*(?P<option_a>.*?)\n
            B\)\s*(?P<option_b>.*?)\n
            C\)\s*(?P<option_c>.*?)\n
            D\)\s*(?P<option_d>.*?)\n
            Correct\s*answer:\s*(?P<correct_option>[A-D])\n
            Difficulty\s*level:\s*(?P<difficulty>\w+)
        """, re.VERBOSE | re.DOTALL)
        
        match = pattern.search(generated_content)
        if match:
            theme = match.group("theme").strip()
            theme = theme.lower()
            question = match.group("question").strip()
            # Combine question and options into one string.
            question_options = (
                f"{question}\n"
                f"A) {match.group('option_a').strip()}\n"
                f"B) {match.group('option_b').strip()}\n"
                f"C) {match.group('option_c').strip()}\n"
                f"D) {match.group('option_d').strip()}"
            )
            correct_option = match.group("correct_option").strip()
            difficulty = match.group("difficulty").strip()
            
            # Replace the following print statements with your actual database storage logic.
            print("Storing data in database...")
            print(f"Theme: {theme}")
            print("Question and Options:")
            print(question_options)
            print(f"Correct Option: {correct_option}")
            print(f"Difficulty: {difficulty}")
            print("-" * 40)
            db_response = add_question_to_db(theme, question_options, correct_option, difficulty)
        
            if db_response == "Duplicate":
             print("Duplicate detected! Regenerating...")
             continue 
            elif db_response is None:
             return jsonify({"error": "Database insertion failed"}), 500
            else:
             return jsonify({
                "message": "Question added successfully!",
                "theme": theme,
                "question": question_options,
                "Correct Option": correct_option,
                "difficulty": difficulty
            })

        else:
            print("Parsing failed for the following content:")
            print(generated_content)
        
        



@app.route('/edit_profile', methods=['POST'])
@jwt_required()
def edit_profile_endpoint():
    logging.info("Edit profile route accessed")
    if request.method == 'POST':
            first_name = request.form.get('first_name')
            last_name = request.form.get('last_name')
            organisation = request.form.get('organisation')
            industry = request.form.get('industry')
            bio = request.form.get('bio')

            

            if not first_name or not last_name:
                return jsonify({"error": "First name and last name is required"}), 400
            response = profile_added_db(first_name, last_name, organisation, industry, bio)

            return response
    
@app.route('/view_profile', methods=['GET'])
@jwt_required()
def view_profile_endpoint():
    logging.info("View profile route accessed")
    response = view_profile_db()
    return response


@app.route('/view_quiz_score', methods=['GET'])
@jwt_required()
def view_quiz_score_endpoint():
    logging.info("View quiz score route accessed")

    user_id = get_jwt_identity()
    quiz_id = request.form.get('quiz_id')
    theme = request.form.get('theme')
    theme = theme.lower()

    if not user_id or not quiz_id or not theme:
        return jsonify({"error": "user_id, quiz_id, and theme are required"}), 400

    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed."}), 500

        cursor = connection.cursor(dictionary=True)

    
        cursor.execute("SELECT theme_quiz_table FROM themes WHERE theme = %s", (theme,))
        theme_entry = cursor.fetchone()

        if not theme_entry:
            logging.warning(f"Theme '{theme}' does not exist in the themes table.")
            return jsonify({"error": "Invalid theme or theme not supported."}), 404

        theme_quiz_table = theme_entry['theme_quiz_table']
        logging.info(f"Theme '{theme}' maps to table '{theme_quiz_table}'.")

        response = view_quiz_score_db(user_id, theme_quiz_table, theme, quiz_id)
        return response

    except mysql.connector.Error as err:
        logging.error("MySQL Error: %s", err)
        return jsonify({"error": "Database operation failed."}), 500

    except Exception as e:
        logging.error("Unexpected error: %s", str(e))
        return jsonify({"error": "An unexpected error occurred."}), 500

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()
            logging.info("Database connection closed.")


@app.route('/recent_quizzes', methods=['GET'])
@jwt_required()
def recent_quizzes_endpoint():
    logging.info("Recent quizzes route accessed")

    user_id = get_jwt_identity()
    if not user_id:
        return jsonify({"error": "User authentication required"}), 401

    response = get_recent_quizzes_db(user_id)

    if "error" in response:
        return jsonify(response), 500
    if "message" in response:
        return jsonify(response), 404

    return jsonify(response), 200


@app.route('/fetch_quiz_for_theme', methods=['GET'])
@jwt_required()
def fetch_quiz_endpoint():
    logging.info("Fetch quiz route accessed")

    user_id = get_jwt_identity()
    if not user_id:
        return jsonify({"error": "User authentication required"}), 401

    theme = request.form.get('theme')
    if not theme:
        return jsonify({"error": "Theme is required"}), 400

    result = fetch_quiz_for_theme_db(user_id, theme)

    if "error" in result:
        return jsonify(result), 500 if "Database" in result["error"] else 404

    return jsonify(result), 200

@app.route('/get_all_themes', methods=['GET'])
@jwt_required()
def get_all_themes():
    logging.info("Get all themes route accessed")

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT theme FROM themes")
        themes = cursor.fetchall()

        # Return only theme names in a list
        theme_list = [row['theme'] for row in themes]
        return jsonify({"themes": theme_list}), 200

    except mysql.connector.Error as err:
        logging.error("Database error while fetching themes: %s", err)
        return jsonify({"error": "Database error occurred"}), 500

    except Exception as e:
        logging.error("Unexpected error while fetching themes: %s", str(e))
        return jsonify({"error": "Unexpected error occurred"}), 500

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()
            logging.info("Database connection closed")

@app.route('/share_attempted_quiz', methods= ['GET'])
@jwt_required()
def share_quiz_endpoint():
    user_id = get_jwt_identity()
    if not user_id:
        return jsonify({"error": "User authentication required"}), 401
    
    quiz_id = request.form.get('quiz_id')
    if not quiz_id:
        return jsonify({"error": "Quiz ID is required"}), 400
    

    quiz_data = get_quiz_details_db(user_id, quiz_id)

    if "error" in quiz_data:
        return jsonify(quiz_data), 500
    if "message" in quiz_data:
        return jsonify(quiz_data), 404


    query_string = urllib.parse.urlencode(quiz_data)

    
    shareable_link = f"http://example.com/shared_quiz?{query_string}"

    return jsonify({"shareable_link": shareable_link}), 200

if __name__ == '__main__':
   logging.info("Starting the Flask application...")
   thread = threading.Thread(target=continuous_generation, daemon=True)
   thread.start()
   logging.info("Starting the application...")
   app.run(host='0.0.0.0',port=5000,debug=True)


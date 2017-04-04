<?php

function getConfig()
{
    return array(
        "url" => "tund.cefns.nau.edu",
        "username" => "gc362script",
        "pword" => "4YCKy7bbN8JT2UG4",
        "dbname" => "gc362"
    );
}

$result = array(
    'success' => 0
);


// returns a mysqli object for easy use
function GetSql($user = '', $pass = '')
{
    $vars = getConfig();
    // get our information ready
    $dburl = $vars['url'];
    $dbusername = $vars['username'];
    $dbpword = $vars['pword'];

    if($user != '') $dbusername = $user;
    if($pass != '') $dbpword = $pass;

    $dbname = $vars['dbname'];
    // this program uses the OOP version of mysqli, as opposed to the procedural version or the PDO
    $sql = new mysqli($dburl, $dbusername, $dbpword, $dbname);
    if ($sql->connect_errno) {
        //die('Failed to connect to MySQL: (' . $sql->connect_errno . ') ' . $sql->connect_error);
        $result['message'] = 'Failed to connect to MySQL: (' . $sql->connect_errno . ') ' . $sql->connect_error;
        echo json_encode($result);
        die();
    } else {
        return $sql;
    }
}

// sanitizes and converts html characters
function mysqli_make_safe($sql, $str)
{
    $html_str = htmlentities($str, ENT_QUOTES);
    return mysqli_real_escape_string($sql, $html_str);
}

// a wrapper for a query, simplifies accessing results
// WARNING: does not sanitize the query string
function sql_query($sql, $qstring)
{
    $rows = array();
    $res = $sql->query($qstring);
    if ($res === true) {
        return true;
    }
     if($res === false)
        return false;
    if ($res->num_rows > 0) {
        while ($row = $res->fetch_assoc()) {
            $rows[count($rows)] = $row;
        }
    }
    return $rows;
}


if(isset($_POST['action']))
{
    $action = $_POST['action'];

    if($action == "login")
    {
        $sql = GetSql();

        $uname = $_POST['username'];
        $pw = $_POST['password'];

        $safe_uname = mysqli_make_safe($sql, $uname);
        $safe_pw = mysqli_make_safe($sql, $pw);

        $res = sql_query($sql, "SELECT * FROM GeVUser WHERE username='$safe_uname' AND password='$safe_pw' AND (expires = 0 OR expires > NOW())");

        if(count($res) > 0)
        {
            $result['success'] = 1;
            $result['username'] = $uname;
            $result['password'] = $pw;
            $result['id'] = intval($res[0]['id']);
            $result['level'] = intval($res[0]['level']);
            $result['expires'] = $res[0]['expires'];
        }
        else
        {
            $result['text'] = "Incorrect information";
        }
    }
    elseif ($action == "createtemp") {

        $sql = GetSql();

        $uname = $_POST['username'];
        $pw = $_POST['password'];
        $expires = $_POST['expires'];

        $safe_uname = mysqli_make_safe($sql, $uname);
        $safe_pw = mysqli_make_safe($sql, $pw);
        $safe_exp = mysqli_make_safe($sql, $expires);

        $res = sql_query($sql, "INSERT INTO GeVUser (username, password, expires) VALUES ('$safe_uname', '$safe_pw', DATE_ADD(NOW(), INTERVAL $safe_exp DAY))");

        $result['success'] = 1;
        $result['res'] = $res;
    }
    elseif ($action == "pastqueries")
    {
        $sql = GetSql();

        $id = $_POST['id'];

        $safe_id = mysqli_make_safe($sql, $id);

        $res = sql_query($sql, "SELECT * FROM GeVQueries where id = $safe_id");

        if($res === false)
        {
            $result['text'] = "Could not get queries";
        }
        else
        {
            $result['success'] = 1;
            $result['res'] = $res;
        }
    }
    elseif ($action == "savequery")
    {
        $sql = GetSql();

        $id = $_POST['id'];
        $qstring = $_POST['qstring'];

        $safe_id = mysqli_make_safe($sql, $id);
        $safe_qstring = mysqli_make_safe($sql, $qstring);

        $res = sql_query($sql, "INSERT INTO GeVQueries (id, query_string) VALUES ($safe_id, '$safe_qstring')");

        if($res === false)
        {
            $result['text'] = 'Could not save query';
        }
        else
        {
            $result['success'] = 1;
            $result['res'] = $res;
        }
    }
}

echo json_encode($result);

 ?>

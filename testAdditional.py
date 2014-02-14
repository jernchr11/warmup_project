import unittest
import os
import testLib


# I did not add any tests for TESTAPI for functional testing. Why? They shouldn't be publicly accesible anyway.

class TestBackend(testLib.RestTestCase):

    """Test adding users"""
    def assertResponse(self, respData, count = 1, errCode = testLib.RestTestCase.SUCCESS):
        """
        Check that the response data dictionary matches the expected values
        """
        expected = { 'errCode' : errCode }
        if count is not None:
            expected['count']  = count
        self.assertDictEqual(expected, respData)

    def testAddTwice(self):
        respData = self.makeRequest("/users/add", method="POST", data = { 'user' : 'user1', 'password' : 'password'} )
        respData = self.makeRequest("/users/add", method="POST", data = { 'user' : 'user1', 'password' : 'password2'} )
        self.assertResponse(respData, None, testLib.RestTestCase.ERR_USER_EXISTS)
    def testLogin(self):
        respData = self.makeRequest("/users/add", method="POST", data = { 'user' : 'user1', 'password' : 'password'} )
        respData = self.makeRequest("/users/login", method="POST", data = { 'user' : 'user1', 'password' : 'password'} )
        self.assertResponse(respData, count = 2)
    def testLoginBadCred(self):
        respData = self.makeRequest("/users/add", method="POST", data = { 'user' : 'user1', 'password' : 'password'} )
        respData = self.makeRequest("/users/login", method="POST", data = { 'user' : 'user1', 'password' : ''} )
        self.assertResponse(respData, None, testLib.RestTestCase.ERR_BAD_CREDENTIALS)
        respData = self.makeRequest("/users/login", method="POST", data = { 'user' : 'user2', 'password' : ''})
        self.assertResponse(respData, None, testLib.RestTestCase.ERR_BAD_CREDENTIALS)

    def testBadUserAndPasswordLengths(self):
        longUser = "u" * 129
        longPass = "p" * 129
        respData = self.makeRequest("/users/login", method="POST", data = { 'user' : longUser, 'password' : ''} )
        self.assertResponse(respData, None, testLib.RestTestCase.ERR_BAD_USERNAME)
        respData = self.makeRequest("/users/login", method="POST", data = { 'user' : '', 'password' : ''} )
        self.assertResponse(respData, None, testLib.RestTestCase.ERR_BAD_USERNAME)
        respData = self.makeRequest("/users/login", method="POST", data = { 'user' : 'user', 'password' : longPass} )
        self.assertResponse(respData, None, testLib.RestTestCase.ERR_BAD_PASSWORD)

        
    def testLoginThreeTimes(self):
        respData = self.makeRequest("/users/add", method="POST", data = { 'user' : 'user1', 'password' : 'password'} )
        respData = self.makeRequest("/users/login", method="POST", data = { 'user' : 'user1', 'password' : 'password'} )
        respData = self.makeRequest("/users/login", method="POST", data = { 'user' : 'user1', 'password' : 'password'} )
        self.assertResponse(respData, count = 3)
    
    def testAddTwoUsersAndLogin(self):
        respData = self.makeRequest("/users/add", method="POST", data = { 'user' : 'user1', 'password' : 'password'} )
        self.assertResponse(respData, count = 1)
        respData = self.makeRequest("/users/add", method="POST", data = { 'user' : 'user2', 'password' : 'password'} )
        self.assertResponse(respData, count = 1)
        respData = self.makeRequest("/users/login", method="POST", data = { 'user' : 'user1', 'password' : 'password'} )
        self.assertResponse(respData, count = 2)
        respData = self.makeRequest("/users/login", method="POST", data = { 'user' : 'user2', 'password' : 'password'} )
        self.assertResponse(respData, count = 2)

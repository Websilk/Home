CREATE PROCEDURE [dbo].[ResetAllPasswords]
AS
	UPDATE Users SET [password]=''
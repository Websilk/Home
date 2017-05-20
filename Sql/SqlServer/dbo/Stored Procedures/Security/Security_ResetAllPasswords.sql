CREATE PROCEDURE [dbo].[Security_ResetAllPasswords]
AS
	UPDATE Users SET [password]=''
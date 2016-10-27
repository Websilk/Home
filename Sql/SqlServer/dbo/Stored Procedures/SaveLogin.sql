-- =============================================
-- Author:		Mark Entingh
-- Create date: 9/19/2012 6:21 pm
-- Description:	save authentication info for a login attempt
-- =============================================
CREATE PROCEDURE SaveLogin 
	@loginId nvarchar(10) = '', 
	@hash nvarchar(100) = '',
	@email nvarchar(100) = ''
AS
BEGIN
	INSERT INTO Login (loginid, hash, email, datecreated) 
	VALUES(@loginId, @hash, @email, GETDATE())
END
